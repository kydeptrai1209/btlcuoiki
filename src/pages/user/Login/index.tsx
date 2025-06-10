import React, { useEffect, useState } from 'react';
import { Form, Input, Button, Typography, Tabs, Alert } from 'antd';
import { 
	UserOutlined, 
	SafetyOutlined, 
	MailOutlined, 
	BankOutlined, 
	IdcardOutlined,
	UserAddOutlined
} from '@ant-design/icons';
import { useModel, history } from 'umi';
import styles from './index.less';

const { TabPane } = Tabs;
const { Title, Text, Paragraph } = Typography;

const Login: React.FC = () => {
	const { login, loading, isLoggedIn, userRole, checkLoginStatus, register } = useModel('auth');
	const [form] = Form.useForm();
	const [registerForm] = Form.useForm();
	const [activeTab, setActiveTab] = useState<string>('1');
	const [registering, setRegistering] = useState<boolean>(false);

	// Kiểm tra trạng thái đăng nhập
	useEffect(() => {
		const { loggedIn, role } = checkLoginStatus();
		if (loggedIn) {
			if (role === 'admin') {
				history.push('/admin/dashboard');
			} else if (role === 'student') {
				history.push('/student/profile');
			} else {
				history.push('/dashboard');
			}
		}
	}, []);

	// Nếu đăng nhập thành công, chuyển đến trang phù hợp
	useEffect(() => {
		if (isLoggedIn) {
			if (userRole === 'admin') {
				history.push('/admin/dashboard');
			} else if (userRole === 'student') {
				history.push('/student/profile');
			} else {
				history.push('/dashboard');
			}
		}
	}, [isLoggedIn, userRole]);

	const onFinish = async (values: { username: string; password: string }) => {
		const result = await login(values.username, values.password);
		if (result.success) {
			form.resetFields();
		}
	};

	const onRegisterFinish = async (values: any) => {
		setRegistering(true);
		try {
			// Tạo thông tin đăng ký cơ bản
			const formattedValues = {
				...values,
				// Thêm các trường bắt buộc
				ngay_sinh: '2000-01-01',
				gioi_tinh: 'Nam',
				sdt: '0000000000'
			};
			
			const result = await register(formattedValues);
			if (result.success) {
				registerForm.resetFields();
				// Chuyển về tab đăng nhập
				setActiveTab('1');
			}
		} finally {
			setRegistering(false);
		}
	};

	const handleTabChange = (key: string) => {
		setActiveTab(key);
		form.resetFields();
		registerForm.resetFields();
	};

	return (
		<div className={styles.container}>
			<div className={styles.main}>
				<Title level={2} className={styles.formTitle}>
					Hệ Thống Quản Lý Tuyển Sinh Đại Học
				</Title>
				<Paragraph className={styles.formDesc}>
					Chào mừng bạn đến với cổng thông tin tuyển sinh trực tuyến
				</Paragraph>

				<Tabs 
					defaultActiveKey="1" 
					centered 
					onChange={handleTabChange}
					tabBarStyle={{ borderBottom: '1px solid #f0f0f0', marginBottom: 24 }}
					activeKey={activeTab}
					type="line"
					size="large"
				>
					<TabPane 
						tab={
							<span>
								<IdcardOutlined />
								Thí Sinh
							</span>
						} 
						key="1"
					/>
					<TabPane 
						tab={
							<span>
								<BankOutlined />
								Quản Trị Viên
							</span>
						} 
						key="2"
					/>
					<TabPane 
						tab={
							<span>
								<UserAddOutlined />
								Đăng Ký
							</span>
						} 
						key="3"
					/>
				</Tabs>

				{activeTab === '1' && (
					<Alert
						message="Thông tin đăng nhập thí sinh"
						description={
							<>
								<div>Sử dụng <Text strong>Email</Text> hoặc <Text strong>Số CCCD</Text> để đăng nhập.</div>
								<div>Mật khẩu mặc định là <Text strong>số CCCD</Text> của bạn.</div>
							</>
						}
						type="info"
						showIcon
						style={{ marginBottom: 24 }}
					/>
				)}

				{/* Form đăng nhập */}
				{(activeTab === '1' || activeTab === '2') && (
					<Form
						form={form}
						name="login"
						onFinish={onFinish}
						size="large"
						layout="vertical"
					>
						<Form.Item
							name="username"
							label={activeTab === '1' ? "Email/CCCD" : "Tên đăng nhập"}
							rules={[{ required: true, message: activeTab === '1' ? 'Vui lòng nhập email hoặc CCCD!' : 'Vui lòng nhập tên đăng nhập!' }]}
						>
							<Input 
								prefix={activeTab === '1' ? <MailOutlined className={styles.prefixIcon} /> : <UserOutlined className={styles.prefixIcon} />} 
								placeholder={activeTab === '1' ? "Nhập email hoặc số CCCD" : "Nhập tên đăng nhập"}
							/>
						</Form.Item>

						<Form.Item
							name="password"
							label="Mật khẩu"
							rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
						>
							<Input.Password
								prefix={<SafetyOutlined className={styles.prefixIcon} />}
								placeholder="Nhập mật khẩu"
							/>
						</Form.Item>

						<Form.Item>
							<Button 
								type="primary" 
								htmlType="submit" 
								loading={loading}
								className={styles.loginButton}
								block
							>
								Đăng Nhập
							</Button>
						</Form.Item>
					</Form>
				)}

				{/* Form đăng ký đã được cập nhật */}
				{activeTab === '3' && (
					<Form
						form={registerForm}
						name="register"
						onFinish={onRegisterFinish}
						size="large"
						layout="vertical"
					>
						<Form.Item
							name="ho_ten"
							label="Họ và tên"
							rules={[{ required: true, message: 'Vui lòng nhập họ và tên!' }]}
						>
							<Input 
								prefix={<UserOutlined className={styles.prefixIcon} />} 
								placeholder="Nhập họ và tên"
							/>
						</Form.Item>

						<Form.Item
							name="email"
							label="Email"
							rules={[
								{ required: true, message: 'Vui lòng nhập email!' },
								{ type: 'email', message: 'Email không hợp lệ!' }
							]}
						>
							<Input
								prefix={<MailOutlined className={styles.prefixIcon} />}
								placeholder="Nhập email liên hệ"
							/>
						</Form.Item>

						<Form.Item
							name="so_cccd"
							label="Số CCCD (dùng làm mật khẩu đăng nhập)"
							rules={[
								{ required: true, message: 'Vui lòng nhập số CCCD!' },
								{ pattern: /^[0-9]{12}$/, message: 'Số CCCD phải đủ 12 chữ số!' }
							]}
						>
							<Input
								prefix={<IdcardOutlined className={styles.prefixIcon} />}
								placeholder="Nhập số CCCD (12 chữ số)"
							/>
						</Form.Item>

						<Form.Item>
							<Button 
								type="primary" 
								htmlType="submit" 
								loading={registering}
								className={styles.loginButton}
								block
								size="large"
							>
								Đăng Ký
							</Button>
						</Form.Item>
					</Form>
				)}
			</div>

			<div className={styles.footer}>
				<Text type="secondary">© 2024 Hệ Thống Quản Lý Tuyển Sinh. All Rights Reserved.</Text>
			</div>
		</div>
	);
};

export default Login;
