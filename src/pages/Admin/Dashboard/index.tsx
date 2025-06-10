import React, { useEffect, useState } from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import { Card, Row, Col, Button, Spin } from 'antd';
import { BankOutlined, FileOutlined, LogoutOutlined, MailOutlined, BarChartOutlined } from '@ant-design/icons';
import { useModel, history } from 'umi';
import styles from './index.less';

const AdminDashboard: React.FC = () => {
  const { userInfo, userRole, isLoggedIn, checkLoginStatus, logout } = useModel('auth');
  const [loading, setLoading] = useState(true);

  // Kiểm tra đăng nhập
  useEffect(() => {
    const { loggedIn, role } = checkLoginStatus();
    if (!loggedIn || role !== 'admin') {
      history.push('/user/login');
    } else {
      // Đã đăng nhập và là admin, hiển thị dashboard
      setLoading(false);
    }
  }, []);

  // Xử lý đăng xuất
  const handleLogout = () => {
    logout();
  };

  const goToSchoolManagement = () => {
    history.push('/admin/schools');
  };

  const goToApplicationManagement = () => {
    history.push('/admin/applications');
  };
  
  const goToEmailSettings = () => {
    history.push('/admin/email-settings');
  };

  const goToStatistics = () => {
    history.push('/admin/statistics');
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size="large" tip="Đang tải..." />
      </div>
    );
  }

  return (
    <PageContainer
      title="Trang quản trị hệ thống"
      subTitle={`Xin chào, ${userInfo?.ho_ten || 'Quản trị viên'}`}
      extra={[
        <Button
          key="1"
          type="primary"
          danger
          icon={<LogoutOutlined />}
          onClick={handleLogout}
        >
          Đăng xuất
        </Button>,
      ]}
    >
      <Row gutter={[24, 24]}>
        <Col xs={24} sm={24} md={12} lg={8}>
          <Card 
            className={styles.dashboardCard} 
            title="Quản lý trường"
            extra={<BankOutlined style={{ fontSize: '24px', color: '#1890ff' }} />}
          >
            <p>Quản lý thông tin các trường đại học trong hệ thống</p>
            <p>Thêm, sửa, xóa thông tin trường</p>
            <p>Cập nhật thông tin chi tiết về trường và ngành học</p>
            <Button 
              type="primary" 
              size="large" 
              style={{ marginTop: 16 }}
              onClick={goToSchoolManagement}
            >
              Quản lý trường
            </Button>
          </Card>
        </Col>
        <Col xs={24} sm={24} md={12} lg={8}>
          <Card 
            className={styles.dashboardCard} 
            title="Quản lý hồ sơ"
            extra={<FileOutlined style={{ fontSize: '24px', color: '#1890ff' }} />}
          >
            <p>Quản lý hồ sơ xét tuyển của thí sinh</p>
            <p>Duyệt hồ sơ, xem thông tin chi tiết</p>
            <p>Cập nhật trạng thái và ghi chú cho hồ sơ</p>
            <Button 
              type="primary" 
              size="large" 
              style={{ marginTop: 16 }}
              onClick={goToApplicationManagement}
            >
              Quản lý hồ sơ
            </Button>
          </Card>
        </Col>
        <Col xs={24} sm={24} md={12} lg={8}>
          <Card 
            className={styles.dashboardCard} 
            title="Cấu hình email"
            extra={<MailOutlined style={{ fontSize: '24px', color: '#1890ff' }} />}
          >
            <p>Cấu hình dịch vụ gửi email thông báo</p>
            <p>Kết nối với EmailJS để gửi email tự động</p>
            <p>Kiểm tra gửi email thử nghiệm</p>
            <Button 
              type="primary" 
              size="large" 
              style={{ marginTop: 16 }}
              onClick={goToEmailSettings}
            >
              Cấu hình email
            </Button>
          </Card>
        </Col>
        <Col xs={24} sm={24} md={12} lg={8}>
          <Card 
            className={styles.dashboardCard} 
            title="Thống kê hồ sơ"
            extra={<BarChartOutlined style={{ fontSize: '24px', color: '#1890ff' }} />}
          >
            <p>Xem thống kê số lượng hồ sơ theo trường/ngành</p>
            <p>Xem thống kê số lượng hồ sơ theo trạng thái</p>
            <p>Tra cứu và tìm kiếm hồ sơ nhanh chóng</p>
            <Button 
              type="primary" 
              size="large" 
              style={{ marginTop: 16 }}
              onClick={goToStatistics}
            >
              Xem thống kê
            </Button>
          </Card>
        </Col>
      </Row>
    </PageContainer>
  );
};

export default AdminDashboard; 