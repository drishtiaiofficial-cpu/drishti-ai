import { Dimensions } from 'react-native';
const { width, height } = Dimensions.get('window');

export const SIZES = {
  width, height,
  padding: { xs: 8, sm: 12, md: 16, lg: 20, xl: 25, xxl: 30 },
  radius: { sm: 8, md: 12, lg: 16, xl: 20, xxl: 24, full: 999 },
  icon: { sm: 16, md: 20, lg: 24, xl: 30, xxl: 40 },
  avatar: { sm: 36, md: 48, lg: 55, xl: 80 },
  button: { height: 52, heightSm: 42 },
  input: { height: 52 },
  headerHeight: 60,
  tabBarHeight: 70,
};
export default SIZES;
