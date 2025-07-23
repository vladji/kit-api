export interface AdminProps {
  uniqId: string;
  disabled: boolean;
  chatEnabled: boolean;
  chatNotificationEnabled: boolean;
  credentials: {
    rootPassHash: string;
  };
}
