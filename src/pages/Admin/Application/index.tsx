import React, { useEffect, useState } from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import { Table, Button, Space, Card, Tag, message, Modal, Form, Input, Typography, Tabs, Badge } from 'antd';
import { EyeOutlined, CheckOutlined, CloseOutlined, FileTextOutlined, ReloadOutlined } from '@ant-design/icons';
import { useModel, history } from 'umi';
import { 
  getAllApplications, 
  getApplicationById, 
  updateApplicationStatus, 
  HoSoType,
  getAllSchools,
  TruongType, 
  getAllMajors,
  NganhType 
} from '@/services/Application';
import { sendApprovalEmail, sendRejectionEmail } from '@/services/Mail';

const { TabPane } = Tabs;
const { Title, Text } = Typography;
const { TextArea } = Input;

const ApplicationManagement: React.FC = () => {
  const { isLoggedIn, checkLoginStatus } = useModel('admin');
  const [loading, setLoading] = useState<boolean>(false);
  const [dataSource, setDataSource] = useState<HoSoType[]>([]);
  const [detailModalVisible, setDetailModalVisible] = useState<boolean>(false);
  const [statusModalVisible, setStatusModalVisible] = useState<boolean>(false);
  const [resetModalVisible, setResetModalVisible] = useState<boolean>(false);
  const [selectedApplication, setSelectedApplication] = useState<HoSoType | null>(null);
  const [newStatus, setNewStatus] = useState<'cho_duyet' | 'da_duyet' | 'tu_choi'>('cho_duyet');
  const [note, setNote] = useState<string>('');
  const [schoolMap, setSchoolMap] = useState<{[key: number]: string}>({});
  const [nganhMap, setNganhMap] = useState<{[key: number]: string}>({});
  const [activeKey, setActiveKey] = useState<string>('all');
  const [resetting, setResetting] = useState<boolean>(false);

  // Form
  const [form] = Form.useForm();

  // Kiểm tra đăng nhập
  useEffect(() => {
    const loggedIn = checkLoginStatus();
    if (!loggedIn) {
      history.push('/admin/login');
    } else {
      fetchData();
      fetchSchoolsAndNganh();
    }
  }, []);

  // Lấy thông tin trường và ngành để hiển thị tên
  const fetchSchoolsAndNganh = async () => {
    try {
      // Lấy danh sách trường
      const schoolResult = await getAllSchools();
      if (schoolResult.success && schoolResult.data) {
        const schoolMapData: {[key: number]: string} = {};
        schoolResult.data.forEach((school: TruongType) => {
          schoolMapData[school.id] = school.ten_truong;
        });
        setSchoolMap(schoolMapData);
      }

      // Lấy danh sách ngành
      const nganhResult = await getAllMajors();
      if (nganhResult.success && nganhResult.data) {
        const nganhMapData: {[key: number]: string} = {};
        nganhResult.data.forEach((nganh: NganhType) => {
          nganhMapData[nganh.id] = nganh.ten_nganh;
        });
        setNganhMap(nganhMapData);
      }
    } catch (error) {
      console.error("Error fetching schools and nganh:", error);
      message.error('Không thể tải thông tin trường và ngành');
    }
  };

  // Lấy dữ liệu hồ sơ
  const fetchData = async () => {
    setLoading(true);
    try {
      const result = await getAllApplications();
      if (result.success) {
        setDataSource(result.data);
      } else {
        message.error(result.message);
      }
    } catch (error) {
      message.error('Không thể tải dữ liệu hồ sơ');
    } finally {
      setLoading(false);
    }
  };

  // Xem chi tiết hồ sơ
  const viewApplicationDetail = async (record: HoSoType) => {
    setSelectedApplication(record);
    setDetailModalVisible(true);
  };

  // Mở modal cập nhật trạng thái
  const openStatusModal = (record: HoSoType, status: 'da_duyet' | 'tu_choi') => {
    setSelectedApplication(record);
    setNewStatus(status);
    setNote(record.ghi_chu || '');
    form.setFieldsValue({ note: record.ghi_chu || '' });
    setStatusModalVisible(true);
  };

  // Cập nhật trạng thái hồ sơ
  const updateStatus = async () => {
    if (!selectedApplication) return;
    
    try {
      const values = await form.validateFields();
      const result = await updateApplicationStatus(selectedApplication.id, newStatus, values.note);
      
      if (result.success) {
        // Đóng modal trước khi gửi email để tránh chờ đợi
        setStatusModalVisible(false);
        
        // Hiển thị thông báo đang gửi email
        const emailKey = 'sending_email';
        message.loading({ content: 'Đang gửi email thông báo...', key: emailKey });

        // Gửi email
        if (selectedApplication.email) {
          const schoolName = schoolMap[selectedApplication.truong_id] || `Trường ID: ${selectedApplication.truong_id}`;
          const majorName = nganhMap[selectedApplication.nganh_id] || `Ngành ID: ${selectedApplication.nganh_id}`;

          try {
            if (newStatus === 'da_duyet') {
              // Gọi service gửi email chấp nhận
              await sendApprovalEmail(
                selectedApplication.email,
                selectedApplication.ho_ten,
                schoolName,
                majorName,
                selectedApplication.diem_thi,
                values.note
              );
              message.success({ content: 'Đã gửi email thông báo đến thí sinh!', key: emailKey, duration: 2 });
            } else if (newStatus === 'tu_choi') {
              // Gọi service gửi email từ chối
              await sendRejectionEmail(
                selectedApplication.email,
                selectedApplication.ho_ten,
                schoolName,
                majorName,
                selectedApplication.diem_thi,
                values.note
              );
              message.success({ content: 'Đã gửi email thông báo đến thí sinh!', key: emailKey, duration: 2 });
            }
          } catch (error) {
            console.error("Lỗi khi gửi email:", error);
            message.error({ content: 'Không thể gửi email thông báo!', key: emailKey, duration: 2 });
          }
        }

        message.success(result.message);
        fetchData(); // Tải lại dữ liệu sau khi cập nhật
      } else {
        message.error(result.message);
      }
    } catch (error) {
      console.error("Error updating status:", error);
      message.error('Không thể cập nhật trạng thái hồ sơ');
    }
  };

  // Reset trạng thái hồ sơ
  const showResetConfirm = () => {
    setResetModalVisible(true);
  };

  const handleReset = async () => {
    setResetting(true);
    try {
      // Reset từng hồ sơ về trạng thái "chờ duyệt"
      let success = true;
      for (const record of dataSource) {
        if (record.trang_thai !== 'cho_duyet') {
          const result = await updateApplicationStatus(
            record.id, 
            'cho_duyet', 
            'Hồ sơ đã được reset về trạng thái chờ duyệt'
          );
          if (!result.success) {
            success = false;
          }
        }
      }
      
      if (success) {
        message.success('Đã reset tất cả hồ sơ về trạng thái chờ duyệt');
        fetchData(); // Tải lại dữ liệu sau khi reset
      } else {
        message.warning('Có một số hồ sơ không thể reset');
      }
    } catch (error) {
      console.error("Error resetting applications:", error);
      message.error('Đã xảy ra lỗi khi reset hồ sơ');
    } finally {
      setResetting(false);
      setResetModalVisible(false);
    }
  };

  // Xử lý trạng thái hiển thị
  const getStatusTag = (status: string) => {
    switch (status) {
      case 'cho_duyet':
        return <Tag color="gold">Chờ duyệt</Tag>;
      case 'da_duyet':
        return <Tag color="green">Đã duyệt</Tag>;
      case 'tu_choi':
        return <Tag color="red">Từ chối</Tag>;
      default:
        return <Tag>{status}</Tag>;
    }
  };

  // Lọc dữ liệu theo tab
  const getFilteredData = () => {
    if (activeKey === 'all') return dataSource;
    return dataSource.filter(item => item.trang_thai === activeKey);
  };

  // Đếm số lượng hồ sơ theo trạng thái
  const countByStatus = (status: string) => {
    return dataSource.filter(item => item.trang_thai === status).length;
  };

  // Xử lý thay đổi tab
  const handleTabChange = (key: string) => {
    setActiveKey(key);
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
      title: 'SĐT',
      dataIndex: 'sdt',
      key: 'sdt',
      width: 120,
    },
    {
      title: 'Trường',
      dataIndex: 'truong_id',
      key: 'truong_id',
      render: (truongId: number) => schoolMap[truongId] || `Trường ID: ${truongId}`,
    },
    {
      title: 'Ngành',
      dataIndex: 'nganh_id',
      key: 'nganh_id',
      render: (nganhId: number) => nganhMap[nganhId] || `Ngành ID: ${nganhId}`,
    },
    {
      title: 'Điểm thi',
      dataIndex: 'diem_thi',
      key: 'diem_thi',
      width: 100,
      sorter: (a: HoSoType, b: HoSoType) => a.diem_thi - b.diem_thi,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'trang_thai',
      key: 'trang_thai',
      width: 120,
      render: (status: string) => getStatusTag(status),
    },
    {
      title: 'Ngày gửi',
      dataIndex: 'ngay_gui',
      key: 'ngay_gui',
      width: 150,
      render: (date: string) => new Date(date).toLocaleDateString('vi-VN'),
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 200,
      render: (text: any, record: HoSoType) => (
        <Space size="small">
          <Button 
            type="primary" 
            icon={<EyeOutlined />} 
            size="small" 
            onClick={() => viewApplicationDetail(record)}
          >
            Chi tiết
          </Button>
          {record.trang_thai === 'cho_duyet' && (
            <>
              <Button 
                type="primary" 
                icon={<CheckOutlined />} 
                size="small" 
                style={{ backgroundColor: 'green', borderColor: 'green' }}
                onClick={() => openStatusModal(record, 'da_duyet')}
              >
                Duyệt
              </Button>
              <Button 
                type="primary" 
                danger 
                icon={<CloseOutlined />} 
                size="small"
                onClick={() => openStatusModal(record, 'tu_choi')}
              >
                Từ chối
              </Button>
            </>
          )}
        </Space>
      ),
    },
  ];

  return (
    <PageContainer title="Quản lý hồ sơ">
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
          <Tabs 
            activeKey={activeKey}
            onChange={handleTabChange}
            style={{ flex: 1 }}
          >
            <TabPane 
              tab={
                <span>
                  Tất cả
                  <Badge count={dataSource.length} style={{ marginLeft: 8, backgroundColor: '#108ee9' }} />
                </span>
              } 
              key="all"
            />
            <TabPane 
              tab={
                <span>
                  Chờ duyệt
                  <Badge count={countByStatus('cho_duyet')} style={{ marginLeft: 8, backgroundColor: '#faad14' }} />
                </span>
              } 
              key="cho_duyet"
            />
            <TabPane 
              tab={
                <span>
                  Đã duyệt
                  <Badge count={countByStatus('da_duyet')} style={{ marginLeft: 8, backgroundColor: '#52c41a' }} />
                </span>
              } 
              key="da_duyet"
            />
            <TabPane 
              tab={
                <span>
                  Từ chối
                  <Badge count={countByStatus('tu_choi')} style={{ marginLeft: 8, backgroundColor: '#ff4d4f' }} />
                </span>
              } 
              key="tu_choi"
            />
          </Tabs>
          
          <Button 
            type="primary"
            icon={<ReloadOutlined />}
            onClick={showResetConfirm}
            style={{ marginLeft: 16 }}
          >
            Reset trạng thái hồ sơ
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={getFilteredData()}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      {/* Modal Xem Chi Tiết Hồ Sơ */}
      <Modal
        title={<Title level={4}><FileTextOutlined /> Chi tiết hồ sơ</Title>}
        visible={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="back" onClick={() => setDetailModalVisible(false)}>
            Đóng
          </Button>
        ]}
        width={700}
      >
        {selectedApplication && (
          <div>
            <div style={{ margin: '8px 0', display: 'flex' }}>
              <div style={{ flex: 1 }}>
                <Text strong>ID:</Text> {selectedApplication.id}
              </div>
              <div style={{ flex: 1 }}>
                <Text strong>Trạng thái:</Text> {getStatusTag(selectedApplication.trang_thai)}
              </div>
            </div>
            
            <div style={{ margin: '8px 0', display: 'flex' }}>
              <div style={{ flex: 1 }}>
                <Text strong>Họ và tên:</Text> {selectedApplication.ho_ten}
              </div>
              <div style={{ flex: 1 }}>
                <Text strong>Ngày sinh:</Text> {new Date(selectedApplication.ngay_sinh).toLocaleDateString('vi-VN')}
              </div>
            </div>
            
            <div style={{ margin: '8px 0', display: 'flex' }}>
              <div style={{ flex: 1 }}>
                <Text strong>CCCD:</Text> {selectedApplication.so_cccd}
              </div>
              <div style={{ flex: 1 }}>
                <Text strong>Giới tính:</Text> {selectedApplication.gioi_tinh}
              </div>
            </div>
            
            <div style={{ margin: '8px 0', display: 'flex' }}>
              <div style={{ flex: 1 }}>
                <Text strong>Email:</Text> {selectedApplication.email}
              </div>
              <div style={{ flex: 1 }}>
                <Text strong>SĐT:</Text> {selectedApplication.sdt}
              </div>
            </div>
            
            <div style={{ margin: '8px 0', display: 'flex' }}>
              <div style={{ flex: 1 }}>
                <Text strong>Điểm thi:</Text> {selectedApplication.diem_thi}
              </div>
              <div style={{ flex: 1 }}>
                <Text strong>Đối tượng ưu tiên:</Text> {selectedApplication.doi_tuong_uu_tien}
              </div>
            </div>
            
            <div style={{ margin: '8px 0', display: 'flex' }}>
              <div style={{ flex: 1 }}>
                <Text strong>Trường:</Text> {schoolMap[selectedApplication.truong_id] || `ID: ${selectedApplication.truong_id}`}
              </div>
              <div style={{ flex: 1 }}>
                <Text strong>Ngành:</Text> {nganhMap[selectedApplication.nganh_id] || `ID: ${selectedApplication.nganh_id}`}
              </div>
            </div>
            
            <div style={{ margin: '8px 0' }}>
              <Text strong>Minh chứng:</Text>
              {selectedApplication.file_minh_chung ? (
                <div style={{ marginTop: 8 }}>
                  {selectedApplication.file_minh_chung.split(',').map((file, index) => {
                    const fileName = file.trim().split('/').pop() || file;
                    const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(file);
                    
                    return (
                      <div key={index} style={{ marginBottom: 4 }}>
                        <Button 
                          type="link" 
                          onClick={() => {
                            if (isImage) {
                              // Hiển thị modal xem ảnh
                              Modal.info({
                                title: 'Xem minh chứng',
                                width: 800,
                                content: (
                                  <div style={{ textAlign: 'center', marginTop: 16 }}>
                                    <img 
                                      src={file} 
                                      alt={fileName}
                                      style={{ maxWidth: '100%', maxHeight: '600px' }} 
                                      onError={(e) => {
                                        e.currentTarget.src = 'https://via.placeholder.com/400x300?text=Không+thể+tải+ảnh';
                                      }}
                                    />
                                  </div>
                                ),
                              });
                            } else {
                              // Đối với file khác, mở trong tab mới
                              window.open(file, '_blank');
                            }
                          }}
                          icon={isImage ? <FileTextOutlined /> : <FileTextOutlined />}
                        >
                          {fileName}
                        </Button>
                      </div>
                    );
                  })}
                </div>
              ) : 'Không có file minh chứng'}
            </div>
            
            <div style={{ margin: '8px 0' }}>
              <Text strong>Ghi chú:</Text> {selectedApplication.ghi_chu || 'Không có'}
            </div>
            
            <div style={{ margin: '8px 0' }}>
              <Text strong>Ngày gửi:</Text> {new Date(selectedApplication.ngay_gui).toLocaleString('vi-VN')}
            </div>
          </div>
        )}
      </Modal>

      {/* Modal Cập Nhật Trạng Thái */}
      <Modal
        title={
          <Title level={4}>
            {newStatus === 'da_duyet' ? <CheckOutlined style={{ color: 'green' }} /> : <CloseOutlined style={{ color: 'red' }} />}
            {newStatus === 'da_duyet' ? ' Duyệt hồ sơ' : ' Từ chối hồ sơ'}
          </Title>
        }
        visible={statusModalVisible}
        onCancel={() => setStatusModalVisible(false)}
        onOk={updateStatus}
        okText={newStatus === 'da_duyet' ? 'Duyệt' : 'Từ chối'}
        okButtonProps={{ 
          style: { backgroundColor: newStatus === 'da_duyet' ? 'green' : 'red', borderColor: newStatus === 'da_duyet' ? 'green' : 'red' } 
        }}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="note"
            label="Ghi chú"
            initialValue={note}
          >
            <TextArea 
              rows={4} 
              placeholder={
                newStatus === 'da_duyet' 
                  ? 'Nhập ghi chú về việc chấp nhận hồ sơ (nếu có)' 
                  : 'Nhập lý do từ chối hồ sơ'
              }
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal Xác nhận Reset */}
      <Modal
        title="Xác nhận reset trạng thái hồ sơ"
        visible={resetModalVisible}
        onCancel={() => setResetModalVisible(false)}
        onOk={handleReset}
        okText="Xác nhận"
        cancelText="Hủy"
        okButtonProps={{ 
          loading: resetting,
          danger: true
        }}
      >
        <p>Bạn có chắc chắn muốn reset tất cả hồ sơ về trạng thái ban đầu (chờ duyệt)?</p>
        <p>Hành động này sẽ giúp bạn có thể demo lại quy trình xử lý hồ sơ từ đầu.</p>
      </Modal>
    </PageContainer>
  );
};

export default ApplicationManagement; 