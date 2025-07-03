import { WeekDays } from "../../types/common";
import { Types } from "mongoose";

interface StoreWorkingTime {
  weekDay: WeekDays;
  time: string;
}

interface StoreContactsProps {
  phone?: string;
  whatsApp?: string;
  telegram?: string;
  zalo?: string;
  instagram?: string;
  facebook?: string;
}

interface ShowcaseProps {
  productName: string;
  productImageUrl: string[];
  productDescription: string;
  productPrice: number;
  group?: string;
  subGroup?: string;
}

export interface StoreProps {
  userId: Types.ObjectId;
  storeName: string;
  storeImageUrl: string[];
  workingTime?: StoreWorkingTime[];
  contacts?: StoreContactsProps;
  showcases?: ShowcaseProps[];
}
