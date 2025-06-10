import React, { useEffect, useState } from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import { Card, Row, Col, Spin, Tabs, message } from 'antd';
import { PieChart, Pie, BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useModel, history } from 'umi';
import axios from 'axios';

const { TabPane } = Tabs;

// Định nghĩa các màu sắc cho biểu đồ
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#8dd1e1', '#a4de6c', '#d0ed57'];

const Statistics: React.FC = () => {
  const { userInfo, userRole, isLoggedIn, checkLoginStatus } = useModel('auth');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Dữ liệu thống kê
  const [schoolStats, setSchoolStats] = useState<any[]>([]);
  const [majorStats, setMajorStats] = useState<any[]>([]);
  const [statusStats, setStatusStats] = useState<any[]>([]);
  
  // Dữ liệu gốc
  const [schools, setSchools] = useState<any[]>([]);
  const [majors, setMajors] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);

  // Kiểm tra đăng nhập
  useEffect(() => {
    const { loggedIn, role } = checkLoginStatus();
    if (!loggedIn || role !== 'admin') {
      history.push('/user/login');
    } else {
      // Đã đăng nhập và là admin, tải dữ liệu
      fetchData();
    }
  }, []);

  // Hàm tải dữ liệu từ json-server
  const fetchData = async () => {
    setLoading(true);
    try {
      // Lấy dữ liệu từ json-server
      const [schoolsRes, majorsRes, applicationsRes] = await Promise.all([
        axios.get('http://localhost:3001/truong'),
        axios.get('http://localhost:3001/nganh'),
        axios.get('http://localhost:3001/ho_so')
      ]);

      // Lưu dữ liệu gốc
      setSchools(schoolsRes.data);
      setMajors(majorsRes.data);
      setApplications(applicationsRes.data);

      // Tạo dữ liệu thống kê
      processData(schoolsRes.data, majorsRes.data, applicationsRes.data);
      setLoading(false);
    } catch (err) {
      console.error('Lỗi khi tải dữ liệu:', err);
      setError('Không thể tải dữ liệu thống kê. Vui lòng thử lại sau!');
      setLoading(false);
      message.error('Có lỗi khi tải dữ liệu thống kê!');
    }
  };

  // Xử lý dữ liệu thống kê
  const processData = (schools: any[], majors: any[], applications: any[]) => {
    // 1. Thống kê theo trường
    const schoolCounts: Record<number, number> = {};
    applications.forEach(app => {
      if (app.truong_id > 0) {
        schoolCounts[app.truong_id] = (schoolCounts[app.truong_id] || 0) + 1;
      }
    });

    const schoolStatsData = schools.map(school => ({
      name: school.ten_truong,
      value: schoolCounts[school.id] || 0,
      id: school.id
    }));
    setSchoolStats(schoolStatsData);

    // 2. Thống kê theo ngành
    const majorCounts: Record<number, number> = {};
    applications.forEach(app => {
      if (app.nganh_id > 0) {
        majorCounts[app.nganh_id] = (majorCounts[app.nganh_id] || 0) + 1;
      }
    });

    const majorStatsData = majors
      .filter(major => majorCounts[major.id] > 0)  // Chỉ lấy các ngành có hồ sơ
      .map(major => ({
        name: major.ten_nganh,
        value: majorCounts[major.id] || 0,
        id: major.id,
        truong_id: major.truong_id
      }));
    setMajorStats(majorStatsData);

    // 3. Thống kê theo trạng thái
    const statusCounts: Record<string, number> = {
      moi_dang_ky: 0,
      cho_duyet: 0,
      da_duyet: 0,
      tu_choi: 0
    };

    applications.forEach(app => {
      if (app.trang_thai) {
        statusCounts[app.trang_thai] = (statusCounts[app.trang_thai] || 0) + 1;
      }
    });

    const statusLabels: Record<string, string> = {
      moi_dang_ky: 'Mới đăng ký',
      cho_duyet: 'Chờ duyệt',
      da_duyet: 'Đã duyệt',
      tu_choi: 'Từ chối'
    };

    const statusStatsData = Object.keys(statusCounts).map(key => ({
      name: statusLabels[key] || key,
      value: statusCounts[key],
      status: key
    }));
    setStatusStats(statusStatsData);
  };

  // Format nhãn cho biểu đồ
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, name }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = 25 + innerRadius + (outerRadius - innerRadius);
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text x={x} y={y} fill="#333" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
        {`${name} (${(percent * 100).toFixed(0)}%)`}
      </text>
    );
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size="large" tip="Đang tải dữ liệu thống kê..." />
      </div>
    );
  }

  if (error) {
    return (
      <PageContainer>
        <Card>
          <div style={{ textAlign: 'center', padding: '50px' }}>
            <h2>Có lỗi xảy ra</h2>
            <p>{error}</p>
            <button onClick={fetchData}>Thử lại</button>
          </div>
        </Card>
      </PageContainer>
    );
  }

  return (
    <PageContainer
      title="Thống kê hồ sơ xét tuyển"
      subTitle="Biểu đồ thống kê theo trường, ngành học và trạng thái"
    >
      <Tabs defaultActiveKey="1" type="card">
        <TabPane tab="Thống kê theo trường" key="1">
          <Card>
            <Row gutter={16}>
              <Col span={12}>
                <h3>Biểu đồ tròn thống kê theo trường</h3>
                <ResponsiveContainer width="100%" height={400}>
                  <PieChart>
                    <Pie
                      data={schoolStats}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      label={renderCustomizedLabel}
                      outerRadius={150}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {schoolStats.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: any) => [`${value} hồ sơ`, 'Số lượng']} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </Col>
              <Col span={12}>
                <h3>Biểu đồ cột thống kê theo trường</h3>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart
                    data={schoolStats}
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
                    <Tooltip formatter={(value: any) => [`${value} hồ sơ`, 'Số lượng']} />
                    <Legend />
                    <Bar dataKey="value" name="Số lượng hồ sơ" fill="#8884d8">
                      {schoolStats.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </Col>
            </Row>
          </Card>
        </TabPane>

        <TabPane tab="Thống kê theo ngành" key="2">
          <Card>
            <Row gutter={16}>
              <Col span={12}>
                <h3>Biểu đồ tròn thống kê theo ngành</h3>
                <ResponsiveContainer width="100%" height={400}>
                  <PieChart>
                    <Pie
                      data={majorStats}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      label={renderCustomizedLabel}
                      outerRadius={150}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {majorStats.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: any) => [`${value} hồ sơ`, 'Số lượng']} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </Col>
              <Col span={12}>
                <h3>Biểu đồ cột thống kê theo ngành</h3>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart
                    data={majorStats}
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
                    <Tooltip formatter={(value: any) => [`${value} hồ sơ`, 'Số lượng']} />
                    <Legend />
                    <Bar dataKey="value" name="Số lượng hồ sơ" fill="#82ca9d">
                      {majorStats.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </Col>
            </Row>
          </Card>
        </TabPane>

        <TabPane tab="Thống kê theo trạng thái" key="3">
          <Card>
            <Row gutter={16}>
              <Col span={12}>
                <h3>Biểu đồ tròn thống kê theo trạng thái</h3>
                <ResponsiveContainer width="100%" height={400}>
                  <PieChart>
                    <Pie
                      data={statusStats}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      label={renderCustomizedLabel}
                      outerRadius={150}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {statusStats.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: any) => [`${value} hồ sơ`, 'Số lượng']} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </Col>
              <Col span={12}>
                <h3>Biểu đồ cột thống kê theo trạng thái</h3>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart
                    data={statusStats}
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
                    <Tooltip formatter={(value: any) => [`${value} hồ sơ`, 'Số lượng']} />
                    <Legend />
                    <Bar dataKey="value" name="Số lượng hồ sơ" fill="#ffc658">
                      {statusStats.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </Col>
            </Row>
          </Card>
        </TabPane>
      </Tabs>
    </PageContainer>
  );
};

export default Statistics; 