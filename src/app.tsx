import Footer from '@/components/Footer';
import RightContent from '@/components/RightContent';
import { notification } from 'antd';
import 'moment/locale/vi';
import type { RequestConfig, RunTimeLayoutConfig } from 'umi';
import { getIntl, getLocale, history } from 'umi';
import type { RequestOptionsInit, ResponseError } from 'umi-request';
import ErrorBoundary from './components/ErrorBoundary';
// import LoadingPage from './components/Loading';
import { OIDCBounder } from './components/OIDCBounder';
import { unCheckPermissionPaths } from './components/OIDCBounder/constant';
import OneSignalBounder from './components/OneSignalBounder';
import TechnicalSupportBounder from './components/TechnicalSupportBounder';
import NotAccessible from './pages/exception/403';
import NotFoundContent from './pages/exception/404';
import type { IInitialState } from './services/base/typing';
import './styles/global.less';
import { currentRole } from './utils/ip';
import emailjs from '@emailjs/browser';
import { initEmailService } from './services/Mail';

/**  loading */
export const initialStateConfig = {
	loading: <></>,
};

/**
 * @see  https://umijs.org/zh-CN/plugins/plugin-initial-state
 * // Tobe removed
 * */
export async function getInitialState(): Promise<IInitialState> {
	// Kiểm tra role từ localStorage để phân quyền
	const adminInfo = localStorage.getItem('adminInfo');
	const userInfo = localStorage.getItem('userInfo');
	
	// Khởi tạo EmailJS
	try {
		const emailSettings = localStorage.getItem('emailjs_settings');
		if (emailSettings) {
			const settings = JSON.parse(emailSettings);
			if (settings.user_id) {
				emailjs.init(settings.user_id);
				console.log('EmailJS đã được khởi tạo từ app.tsx với ID:', settings.user_id);
			}
		}
		// Sử dụng hàm khởi tạo từ service
		initEmailService();
	} catch (error) {
		console.error('Lỗi khi khởi tạo EmailJS:', error);
	}
	
	return {
		permissionLoading: true,
		userRole: adminInfo ? 'admin' : userInfo ? 'student' : null,
	};
}

// Tobe removed
const authHeaderInterceptor = (url: string, options: RequestOptionsInit) => ({});

/**
 * @see https://beta-pro.ant.design/docs/request-cn
 */
export const request: RequestConfig = {
	errorHandler: (error: ResponseError) => {
		const { messages } = getIntl(getLocale());
		const { response } = error;

		if (response && response.status) {
			const { status, statusText, url } = response;
			const requestErrorMessage = messages['app.request.error'];
			const errorMessage = `${requestErrorMessage} ${status}: ${url}`;
			const errorDescription = messages[`app.request.${status}`] || statusText;
			notification.error({
				message: errorMessage,
				description: errorDescription,
			});
		}

		if (!response) {
			notification.error({
				description: 'Yêu cầu gặp lỗi',
				message: 'Bạn hãy thử lại sau',
			});
		}
		throw error;
	},
	requestInterceptors: [authHeaderInterceptor],
};

// ProLayout  https://procomponents.ant.design/components/layout
export const layout: RunTimeLayoutConfig = ({ initialState }) => {
	return {
		unAccessible: (
			<OIDCBounder>
				<TechnicalSupportBounder>
					<NotAccessible />
				</TechnicalSupportBounder>
			</OIDCBounder>
		),
		noFound: <NotFoundContent />,
		rightContentRender: () => <RightContent />,
		disableContentMargin: false,
		headerTitleRender: () => null,

		footerRender: () => <Footer />,

		onPageChange: () => {
			const { location } = history;
			const { pathname } = location;
			
			// Kiểm tra role từ localStorage
			const adminInfo = localStorage.getItem('adminInfo');
			const userInfo = localStorage.getItem('userInfo');
			const isAdmin = adminInfo !== null;
			const isStudent = userInfo !== null;
			
			// Kiểm tra các trang cần đăng nhập
			const needsAuth = !['/user/login'].includes(pathname);
			
			// Nếu không đăng nhập và đang cố truy cập trang cần đăng nhập
			if (!isAdmin && !isStudent && needsAuth) {
				history.push('/user/login');
				return;
			}
			
			// Nếu đăng nhập dưới quyền thí sinh nhưng cố truy cập trang admin
			if (!isAdmin && isStudent && pathname.startsWith('/admin')) {
				history.push('/403');
				return;
			}
			
			// Kiểm tra đường dẫn mặc định
			if (pathname === '/') {
				if (isAdmin) {
					history.push('/admin/dashboard');
				} else if (isStudent) {
					history.push('/dashboard');
				} else {
					history.push('/user/login');
				}
			}
			
			// Các kiểm tra khác
			if (initialState?.currentUser) {
				const isUncheckPath = unCheckPermissionPaths.some((path) => pathname.includes(path));

				if (
					!isUncheckPath &&
					currentRole &&
					initialState?.authorizedPermissions?.length &&
					!initialState?.authorizedPermissions?.find((item) => item.rsname === currentRole)
				)
					history.push('/403');
			}
		},

		menuItemRender: (item: any, dom: any) => (
			<a
				className='not-underline'
				key={item?.path}
				href={item?.path}
				onClick={(e) => {
					e.preventDefault();
					history.push(item?.path ?? '/');
				}}
				style={{ display: 'block' }}
			>
				{dom}
			</a>
		),

		childrenRender: (dom) => (
			<OIDCBounder>
				<ErrorBoundary>
					{/* <TechnicalSupportBounder> */}
					<OneSignalBounder>{dom}</OneSignalBounder>
					{/* </TechnicalSupportBounder> */}
				</ErrorBoundary>
			</OIDCBounder>
		),
		menuHeaderRender: undefined,
		...initialState?.settings,
	};
};
