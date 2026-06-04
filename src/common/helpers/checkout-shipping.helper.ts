export type CheckoutAddressInput = {
  postalCode: string;
  prefecture?: string | null;
  city: string;
  addressLine1: string;
  addressLine2?: string | null;
};

export type ShippingZoneQuoteRow = {
  id: string;
  name: string;
  deliveryDays: number;
  locations: string[];
  surcharge: number;
};

export type ShippingFeeRuleQuoteRow = {
  shippingTypeKey: string;
  baseFee: number;
  zoneId: string;
};

export type ShippingSettingsQuoteRow = {
  freeShippingEnabled: boolean;
  freeShippingThreshold: number;
} | null;

export type ShippingTypeQuoteRow = {
  key: string;
  name: string;
};

export type DeliveryOption = {
  value: string;
  label: string;
  sublabel: string;
  badge?: string;
};

export type CheckoutShippingQuote = {
  zone: {
    id: string;
    name: string;
    deliveryDays: number;
    surcharge: number;
  };
  shippingTypes: Array<{
    key: string;
    name: string;
    fee: number;
  }>;
  surchargeFee: number;
  totalFee: number;
  isFreeShipping: boolean;
  checkoutShippingMethod: 'standard' | 'cool' | 'frozen';
  deliveryOptions: DeliveryOption[];
};

const FREE_SHIPPING_THRESHOLD = 80_000;

export function resolveShippingZone(
  address: CheckoutAddressInput,
  zones: ShippingZoneQuoteRow[],
) {
  const haystacks = [
    address.postalCode,
    address.prefecture ?? '',
    address.city,
    address.addressLine1,
    address.addressLine2 ?? '',
  ]
    .map(normalizeText)
    .filter(Boolean);

  const matchedZone = zones.find((zone) =>
    zone.locations.some((location) => {
      const normalizedLocation = normalizeText(location);
      return haystacks.some(
        (value) =>
          value.includes(normalizedLocation) ||
          normalizedLocation.includes(value),
      );
    }),
  );

  if (matchedZone) {
    return matchedZone;
  }

  return zones.find((zone) => normalizeText(zone.name).includes('other')) ?? null;
}

export function buildCheckoutShippingQuote(input: {
  address: CheckoutAddressInput;
  subtotal: number;
  shippingTypeKeys: string[];
  shippingTypes: ShippingTypeQuoteRow[];
  feeRules: ShippingFeeRuleQuoteRow[];
  zones: ShippingZoneQuoteRow[];
  settings: ShippingSettingsQuoteRow;
}): CheckoutShippingQuote {
  const zone = resolveShippingZone(input.address, input.zones);

  if (!zone) {
    throw new Error('No shipping zones are configured.');
  }

  const uniqueShippingTypeKeys = [...new Set(input.shippingTypeKeys)];
  const shippingTypes = uniqueShippingTypeKeys.map((key) => {
    const shippingType = input.shippingTypes.find((item) => item.key === key);
    const feeRule = input.feeRules.find(
      (rule) => rule.shippingTypeKey === key && rule.zoneId === zone.id,
    );

    return {
      key,
      name: shippingType?.name ?? key,
      fee: feeRule?.baseFee ?? 0,
    };
  });

  const baseTypeFee = shippingTypes.reduce((sum, item) => sum + item.fee, 0);
  const surchargeFee = zone.surcharge;
  const shouldUseFreeShipping =
    input.subtotal >= FREE_SHIPPING_THRESHOLD ||
    (!!input.settings?.freeShippingEnabled &&
      input.subtotal >= (input.settings?.freeShippingThreshold ?? 0));

  const totalFee = shouldUseFreeShipping ? 0 : baseTypeFee + surchargeFee;

  return {
    zone: {
      id: zone.id,
      name: zone.name,
      deliveryDays: zone.deliveryDays,
      surcharge: zone.surcharge,
    },
    shippingTypes,
    surchargeFee,
    totalFee,
    isFreeShipping: shouldUseFreeShipping,
    checkoutShippingMethod: deriveCheckoutShippingMethod(uniqueShippingTypeKeys),
    deliveryOptions: buildDeliveryOptions(zone.deliveryDays),
  };
}

function buildDeliveryOptions(deliveryDays: number): DeliveryOption[] {
  const firstDate = addCalendarDays(new Date(), Math.max(1, deliveryDays));
  const secondDate = addCalendarDays(firstDate, 1);
  const thirdDate = addCalendarDays(secondDate, 1);

  return [firstDate, secondDate, thirdDate].map((date, index) => ({
    value: date.toISOString().slice(0, 10),
    label: date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
    }),
    sublabel:
      index === 0
        ? `${date.getFullYear()} • Arrives earliest`
        : `${date.getFullYear()} • + ${index} day${index > 1 ? 's' : ''}`,
    badge: index === 0 ? 'FASTEST' : undefined,
  }));
}

function addCalendarDays(startDate: Date, calendarDays: number) {
  const result = new Date(startDate);
  result.setDate(result.getDate() + calendarDays);
  return result;
}

function deriveCheckoutShippingMethod(shippingTypeKeys: string[]) {
  if (shippingTypeKeys.includes('frozen')) {
    return 'frozen' as const;
  }

  if (
    shippingTypeKeys.includes('heavy') ||
    shippingTypeKeys.length > 1 ||
    shippingTypeKeys.some((key) => key !== 'dry')
  ) {
    return 'cool' as const;
  }

  return 'standard' as const;
}

function normalizeText(value: string) {
  return value.trim().toLowerCase();
}
