import axios, { AxiosResponse } from 'axios';
export interface PricingDiscounts {
  country: string;
  countryFlag: string;
  couponCode: string;
  message: string;
  discountPercentage: string;
}

// Need to remove the identifier
export async function getPricingDiscounts(
  url: string,
): Promise<AxiosResponse<PricingDiscounts>> {
  return await axios({
    method: 'get',
    url: `https://api.paritydeals.com/api/v1/deals/discount/?url=${url}&pd_identifier=db90734d-98b6-41af-a52c-f1fb44d84e98`,
  });
}
