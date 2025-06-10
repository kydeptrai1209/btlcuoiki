import React, { useEffect, useState } from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import { 
  Card, 
  Row, 
  Col, 
  Tabs, 
  Input, 
  Table, 
  Tag, 
  message, 
  Typography, 
  Spin, 
  Empty 
} from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { useModel, history } from 'umi';
import { 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  Cell 
} from 'recharts';
import { 
  getApplicationStatsBySchool, 
  getApplicationStatsByMajor, 
  getApplicationStatsByStatus,
  searchApplications,
  HoSoType,
  ApplicationStatType
} from '@/services/Application';
import styles from './index.less';

const { TabPane } = Tabs;
const { Text, Title } = Typography;

const COLORS = ['#1890ff', '#13c2c2', '#52c41a', '#fa8c16', '#722ed1', '#eb2f96', '#f5222d'];
const STATUS_COLORS = {
  cho_duyet: '#fa8c16',
  da_duyet: '#52c41a',
  tu_choi: '#f5222d',
};

const STATUS_LABELS = {
  cho_duyet: 'Chờ duyệt',
  da_duyet: 'Đã duyệt',
  tu_choi: 'Từ chối',
};

const Statistics: React.FC = () => {
  const { userInfo, userRole, checkLoginStatus } = useModel('auth');
  const [loading, setLoading] = useState(true);
  const [schoolStats, setSchoolStats] = useState<ApplicationStatType[]>([]);
  const [majorStats, setMajorStats] = useState<ApplicationStatType[]>([]);
  const [statusStats, setStatusStats] = useState<ApplicationStatType[]>([]);
  const [searchResults, setSearchResults] = useState<HoSoType[]>([]);
  const [searchKeyword, setSearchKeyword] = useState<string>('');
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    const { loggedIn, role } = checkLoginStatus();
    if (!loggedIn || role !== 'admin') {
      history.push('/user/login');
    } else {
      fetchAllStats();
    }
  }, []);

  const fetchAllStats = async () => {
    setLoading(true);
    try {
      const [schoolResponse, majorResponse, statusResponse] = await Promise.all([
        getApplicationStatsBySchool(),
        getApplicationStatsByMajor(),
        getApplicationStatsByStatus(),
      ]);

      if (schoolResponse.success) {
        setSchoolStats(schoolResponse.data);
      } else {
        message.error('Lỗi khi lấy thống kê theo trường');
      }

      if (majorResponse.success) {
        setMajorStats(majorResponse.data);
      } else {
        message.error('Lỗi khi lấy thống kê theo ngành');
      }

      if (statusResponse.success) {
        setStatusStats(statusResponse.data);
      } else {
        message.error('Lỗi khi lấy thống kê theo trạng thái');
      }
    } catch (error) {
      message.error('Có lỗi xảy ra khi tải dữ liệu thống kê');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchKeyword.trim()) {
      return;
    }

    setSearching(true);
    try {
      const response = await searchApplications(searchKeyword);
      if (response.success) {
        setSearchResults(response.data);
      } else {
        message.error(response.message);
      }
    } catch (error) {
      message.error('Có lỗi xảy ra khi tìm kiếm');
    } finally {
      setSearching(false);
    }
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 60,
    },
    {
      title: 'Họ tên',
      dataIndex: 'ho_ten',
      key: 'ho_ten',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Ngày gửi',
      dataIndex: 'ngay_gui',
      key: 'ngay_gui',
      render: (text: string) => new Date(text).toLocaleDateString('vi-VN'),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'trang_thai',
      key: 'trang_thai',
      render: (status: string) => (
        <Tag 
          color={STATUS_COLORS[status as keyof typeof STATUS_COLORS]}
        >
          {STATUS_LABELS[status as keyof typeof STATUS_LABELS]}
        </Tag>
      ),
    },
    {
      title: 'Chi tiết',
      key: 'action',
      render: (text: any, record: HoSoType) => (
        <a onClick={() => history.push(`/admin/applications/${record.id}`)}>Xem</a>
      ),
    },
  ];

  const renderChart = (data: ApplicationStatType[], type: 'bar' | 'pie') => {
    if (!data || data.length === 0) {
      return <Empty description="Không có dữ liệu" />;
    }

    if (type === 'bar') {
      return (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="value" name="Số lượng hồ sơ" fill="#1890ff" />
          </BarChart>
        </ResponsiveContainer>
      );
    }

    return (
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => [`${value} hồ sơ`, 'Số lượng']} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    );
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size="large" tip="Đang tải..." />
      </div>
    );
  }

  return (
    <PageContainer title="Thống kê hồ sơ" subTitle="Phân tích và tìm kiếm hồ sơ xét tuyển">
      <div className={styles.statisticsContainer}>
        <Tabs defaultActiveKey="1" className={styles.tabsContainer}>
          <TabPane tab="Thống kê theo trường/ngành" key="1">
            <Row gutter={[24, 24]}>
              <Col xs={24} md={12}>
                <Card 
                  title="Thống kê theo trường" 
                  className={styles.statisticsCard}
                  loading={loading}
                >
                  <div className={styles.chartContainer}>
                    {renderChart(schoolStats, 'bar')}
                  </div>
                </Card>
              </Col>
              <Col xs={24} md={12}>
                <Card 
                  title="Thống kê theo ngành" 
                  className={styles.statisticsCard}
                  loading={loading}
                >
                  <div className={styles.chartContainer}>
                    {renderChart(majorStats, 'bar')}
                  </div>
                </Card>
              </Col>
            </Row>
          </TabPane>
          <TabPane tab="Thống kê theo trạng thái" key="2">
            <Row gutter={[24, 24]}>
              <Col xs={24} md={12}>
                <Card 
                  title="Thống kê theo trạng thái" 
                  className={styles.statisticsCard}
                  loading={loading}
                >
                  <div className={styles.chartContainer}>
                    {renderChart(statusStats, 'pie')}
                  </div>
                </Card>
              </Col>
              <Col xs={24} md={12}>
                <Card 
                  title="Chi tiết trạng thái" 
                  className={styles.statisticsCard}
                  loading={loading}
                >
                  {statusStats.map((item) => (
                    <div key={item.key} style={{ marginBottom: 16 }}>
                      <Text>{item.name}</Text>
                      <div style={{ 
                        height: 20, 
                        background: STATUS_COLORS[item.key as keyof typeof STATUS_COLORS] || '#1890ff',
                        width: `${Math.min(100, (item.value / Math.max(...statusStats.map(s => s.value))) * 100)}%`,
                        borderRadius: 4,
                        padding: '0 8px',
                        color: '#fff',
                        lineHeight: '20px',
                        marginTop: 8,
                      }}>
                        {item.value} hồ sơ
                      </div>
                    </div>
                  ))}
                </Card>
              </Col>
            </Row>
          </TabPane>
          <TabPane tab="Tra cứu hồ sơ" key="3">
            <Card 
              title="Tìm kiếm hồ sơ" 
              className={styles.statisticsCard}
            >
              <div className={styles.searchContainer}>
                <Input.Search
                  placeholder="Nhập từ khóa tìm kiếm (tên, email, CCCD,...)"
                  enterButton={<><SearchOutlined /> Tìm kiếm</>}
                  size="large"
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  onSearch={handleSearch}
                  loading={searching}
                />
              </div>

              <div className={styles.resultContainer}>
                {searchResults.length > 0 ? (
                  <Table 
                    columns={columns} 
                    dataSource={searchResults} 
                    rowKey="id" 
                    pagination={{ pageSize: 10 }}
                  />
                ) : (
                  searchKeyword && !searching && (
                    <Empty description="Không tìm thấy kết quả" />
                  )
                )}
              </div>
            </Card>
          </TabPane>
        </Tabs>
      </div>
    </PageContainer>
  );
};

export default Statistics; 