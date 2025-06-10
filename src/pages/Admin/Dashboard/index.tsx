import React, { useEffect, useState } from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import { Card, Row, Col, Button, Spin, Statistic } from 'antd';
import { BankOutlined, FileOutlined, LogoutOutlined, MailOutlined, BarChartOutlined, UserOutlined, CheckCircleOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { useModel, history } from 'umi';
import styles from './index.less';
import axios from 'axios';

// Định nghĩa kiểu dữ liệu cho hồ sơ
interface Application {
  id: number;
  trang_thai: string;
  [key: string]: any;
}

const AdminDashboard: React.FC = () => {
  const { userInfo, userRole, isLoggedIn, checkLoginStatus, logout } = useModel('auth');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalSchools: 0,
    totalApplications: 0,
    pendingApplications: 0
  });

  // Kiểm tra đăng nhập
  useEffect(() => {
    const { loggedIn, role } = checkLoginStatus();
    if (!loggedIn || role !== 'admin') {
      history.push('/user/login');
    } else {
      // Đã đăng nhập và là admin, hiển thị dashboard
      setLoading(false);
      fetchStats();
    }
  }, []);

  // Lấy số liệu thống kê
  const fetchStats = async () => {
    try {
      const [schoolsRes, applicationsRes] = await Promise.all([
        axios.get('http://localhost:3001/truong'),
        axios.get<Application[]>('http://localhost:3001/ho_so')
      ]);
      
      const pendingApps = applicationsRes.data.filter((app: Application) => app.trang_thai === 'cho_duyet');
      
      setStats({
        totalSchools: schoolsRes.data.length,
        totalApplications: applicationsRes.data.length,
        pendingApplications: pendingApps.length
      });
    } catch (error) {
      console.error('Lỗi khi tải dữ liệu thống kê:', error);
    }
  };

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
    <div>
      {/* Banner đẹp mắt ở đầu trang */}
      <div className={styles.dashboardHeader}>
        <h1>Trang quản trị hệ thống</h1>
        <div className={styles.welcomeMessage}>Xin chào, {userInfo?.ho_ten || 'Quản trị viên'}</div>
        
        <div className={styles.statsRow}>
          <div className={styles.statItem}>
            <div className={styles.statValue}>{stats.totalSchools}</div>
            <div className={styles.statLabel}>Trường đại học</div>
          </div>
          <div className={styles.statItem}>
            <div className={styles.statValue}>{stats.totalApplications}</div>
            <div className={styles.statLabel}>Tổng hồ sơ</div>
          </div>
          <div className={styles.statItem}>
            <div className={styles.statValue}>{stats.pendingApplications}</div>
            <div className={styles.statLabel}>Chờ duyệt</div>
          </div>
          <div className={styles.statItem}>
            <Button 
              type="primary" 
              className={styles.logoutButton}
              icon={<LogoutOutlined />} 
              onClick={handleLogout}
            >
              Đăng xuất
            </Button>
          </div>
        </div>
      </div>
      
      <Row gutter={24}>
        <Col span={6}>
          <Card className={styles.dashboardCard}>
            <div className={`${styles.iconBox} ${styles.blue}`}>
              <BankOutlined />
            </div>
            <h3>Quản lý trường</h3>
            <p>Thêm, sửa, xóa thông tin trường và quản lý ngành học</p>
            <Button 
              type="primary" 
              block
              onClick={goToSchoolManagement}
            >
              Quản lý trường
            </Button>
          </Card>
        </Col>
        <Col span={6}>
          <Card className={styles.dashboardCard}>
            <div className={`${styles.iconBox} ${styles.green}`}>
              <FileOutlined />
            </div>
            <h3>Quản lý hồ sơ</h3>
            <p>Duyệt hồ sơ xét tuyển, cập nhật trạng thái và ghi chú</p>
            <Button 
              type="primary" 
              block
              style={{ background: '#52c41a', borderColor: '#52c41a' }}
              onClick={goToApplicationManagement}
            >
              Quản lý hồ sơ
            </Button>
          </Card>
        </Col>
        <Col span={6}>
          <Card className={styles.dashboardCard}>
            <div className={`${styles.iconBox} ${styles.orange}`}>
              <BarChartOutlined />
            </div>
            <h3>Thống kê hồ sơ</h3>
            <p>Phân tích dữ liệu theo trường, ngành học và trạng thái</p>
            <Button 
              type="primary" 
              block
              style={{ background: '#faad14', borderColor: '#faad14' }}
              onClick={goToStatistics}
            >
              Xem thống kê
            </Button>
          </Card>
        </Col>
        <Col span={6}>
          <Card className={styles.dashboardCard}>
            <div className={`${styles.iconBox} ${styles.purple}`}>
              <MailOutlined />
            </div>
            <h3>Cấu hình email</h3>
            <p>Thiết lập dịch vụ gửi email thông báo tự động</p>
            <Button 
              type="primary" 
              block
              style={{ background: '#722ed1', borderColor: '#722ed1' }}
              onClick={goToEmailSettings}
            >
              Cấu hình email
            </Button>
          </Card>
        </Col>
      </Row>
      
      <Row gutter={24} style={{ marginTop: 24 }}>
        <Col span={24}>
          <Card 
            title={
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <ClockCircleOutlined style={{ marginRight: 8, color: '#faad14' }} />
                <span>Hồ sơ chờ xử lý</span>
              </div>
            }
          >
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <Statistic 
                value={stats.pendingApplications} 
                suffix={`/ ${stats.totalApplications} hồ sơ`}
                valueStyle={{ color: stats.pendingApplications > 0 ? '#faad14' : '#52c41a' }}
              />
              <Button 
                type="primary" 
                style={{ marginTop: 16 }}
                onClick={goToApplicationManagement}
              >
                Xử lý ngay
              </Button>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AdminDashboard; 