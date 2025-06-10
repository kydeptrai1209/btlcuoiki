import { Settings as LayoutSettings } from '@ant-design/pro-layout';

const Settings: LayoutSettings & {
	pwa?: boolean;
	logo?: string;
	borderRadiusBase: string;
	siderWidth: number;
} = {
	navTheme: 'light',
	primaryColor: process.env.APP_CONFIG_PRIMARY_COLOR,
	borderRadiusBase: '2px',
	layout: 'mix',
	contentWidth: 'Fluid',
	fixedHeader: false,
	fixSiderbar: true,
	colorWeak: false,
	title: '',
	pwa: false,
	logo: '',
	iconfontUrl: '',
	headerTheme: 'light',
	headerHeight: 60,
	siderWidth: 220,
};

export default Settings;
