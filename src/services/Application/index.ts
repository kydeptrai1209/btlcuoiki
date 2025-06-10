import axios from 'axios';

// Interface cho hồ sơ
export interface HoSoType {
  id: number;
  ho_ten: string;
  ngay_sinh: string;
  gioi_tinh: string;
  so_cccd: string;
  email: string;
  sdt: string;
  diem_thi: number;
  doi_tuong_uu_tien: string;
  truong_id: number;
  nganh_id: number;
  to_hop_id?: number;
  file_minh_chung: string;
  trang_thai: 'cho_duyet' | 'da_duyet' | 'tu_choi';
  ngay_gui: string;
  ghi_chu: string;
}

export interface TruongType {
  id: number;
  ma_truong: string;
  ten_truong: string;
  dia_chi: string;
  loai_truong: string;
}

export interface NganhType {
  id: number;
  truong_id: number;
  ma_nganh: string;
  ten_nganh: string;
  mo_ta: string;
}

// Interface cho thống kê hồ sơ
export interface ApplicationStatType {
  key: string | number;
  name: string;
  value: number;
}

const API_URL = '/json-server';

/**
 * Lấy danh sách tất cả hồ sơ
 */
export const getAllApplications = async () => {
  try {
    const response = await axios.get(`${API_URL}/ho_so`);
    return {
      success: true,
      message: 'Lấy danh sách hồ sơ thành công',
      data: response.data as HoSoType[],
    };
  } catch (error) {
    return {
      success: false,
      message: 'Có lỗi xảy ra khi kết nối đến máy chủ',
      data: [],
    };
  }
};

/**
 * Lấy chi tiết hồ sơ theo ID
 */
export const getApplicationById = async (id: number) => {
  try {
    const response = await axios.get(`${API_URL}/ho_so/${id}`);
    return {
      success: true,
      message: 'Lấy thông tin hồ sơ thành công',
      data: response.data as HoSoType,
    };
  } catch (error) {
    return {
      success: false,
      message: 'Có lỗi xảy ra khi kết nối đến máy chủ',
      data: null,
    };
  }
};

/**
 * Cập nhật trạng thái hồ sơ
 */
export const updateApplicationStatus = async (
  id: number,
  trang_thai: 'cho_duyet' | 'da_duyet' | 'tu_choi',
  ghi_chu?: string
) => {
  try {
    const response = await axios.patch(`${API_URL}/ho_so/${id}`, {
      trang_thai,
      ghi_chu: ghi_chu || '',
    });
    
    return {
      success: true,
      message: 'Cập nhật trạng thái hồ sơ thành công',
      data: response.data as HoSoType,
    };
  } catch (error) {
    return {
      success: false,
      message: 'Có lỗi xảy ra khi kết nối đến máy chủ',
      data: null,
    };
  }
};

/**
 * Lấy danh sách tất cả trường học
 */
export const getAllSchools = async () => {
  try {
    const response = await axios.get(`${API_URL}/truong`);
    return {
      success: true,
      message: 'Lấy danh sách trường thành công',
      data: response.data as TruongType[],
    };
  } catch (error) {
    return {
      success: false,
      message: 'Có lỗi xảy ra khi kết nối đến máy chủ',
      data: [],
    };
  }
};

/**
 * Lấy danh sách tất cả ngành học
 */
export const getAllMajors = async () => {
  try {
    const response = await axios.get(`${API_URL}/nganh`);
    return {
      success: true,
      message: 'Lấy danh sách ngành thành công',
      data: response.data as NganhType[],
    };
  } catch (error) {
    return {
      success: false,
      message: 'Có lỗi xảy ra khi kết nối đến máy chủ',
      data: [],
    };
  }
};

/**
 * Lấy thống kê số lượng hồ sơ theo trường
 */
export const getApplicationStatsBySchool = async () => {
  try {
    // Lấy tất cả dữ liệu hồ sơ và trường
    const [applicationsResponse, schoolsResponse] = await Promise.all([
      axios.get(`${API_URL}/ho_so`),
      axios.get(`${API_URL}/truong`)
    ]);

    const applications = applicationsResponse.data as HoSoType[];
    const schools = schoolsResponse.data as TruongType[];
    
    // Tạo thống kê từ dữ liệu
    const schoolStats: Record<number, number> = {};
    
    // Đếm số lượng hồ sơ theo trường_id
    applications.forEach(app => {
      if (app.truong_id > 0) {
        schoolStats[app.truong_id] = (schoolStats[app.truong_id] || 0) + 1;
      }
    });
    
    // Chuyển đổi thành dạng mảng với tên trường
    const result: ApplicationStatType[] = Object.keys(schoolStats).map(id => {
      const schoolId = parseInt(id);
      const school = schools.find(s => s.id === schoolId);
      return {
        key: schoolId,
        name: school ? school.ten_truong : `Trường ${schoolId}`,
        value: schoolStats[schoolId]
      };
    });
    
    return {
      success: true,
      message: 'Lấy thống kê hồ sơ theo trường thành công',
      data: result,
    };
  } catch (error) {
    console.error('Lỗi khi lấy thống kê theo trường:', error);
    return {
      success: false,
      message: 'Có lỗi xảy ra khi kết nối đến máy chủ',
      data: [],
    };
  }
};

/**
 * Lấy thống kê số lượng hồ sơ theo ngành
 */
export const getApplicationStatsByMajor = async () => {
  try {
    // Lấy tất cả dữ liệu hồ sơ và ngành học
    const [applicationsResponse, majorsResponse] = await Promise.all([
      axios.get(`${API_URL}/ho_so`),
      axios.get(`${API_URL}/nganh`)
    ]);

    const applications = applicationsResponse.data as HoSoType[];
    const majors = majorsResponse.data as NganhType[];
    
    // Tạo thống kê từ dữ liệu
    const majorStats: Record<number, number> = {};
    
    // Đếm số lượng hồ sơ theo nganh_id
    applications.forEach(app => {
      if (app.nganh_id > 0) {
        majorStats[app.nganh_id] = (majorStats[app.nganh_id] || 0) + 1;
      }
    });
    
    // Chuyển đổi thành dạng mảng với tên ngành
    const result: ApplicationStatType[] = Object.keys(majorStats).map(id => {
      const majorId = parseInt(id);
      const major = majors.find(m => m.id === majorId);
      return {
        key: majorId,
        name: major ? major.ten_nganh : `Ngành ${majorId}`,
        value: majorStats[majorId]
      };
    });
    
    return {
      success: true,
      message: 'Lấy thống kê hồ sơ theo ngành thành công',
      data: result,
    };
  } catch (error) {
    console.error('Lỗi khi lấy thống kê theo ngành:', error);
    return {
      success: false,
      message: 'Có lỗi xảy ra khi kết nối đến máy chủ',
      data: [],
    };
  }
};

/**
 * Lấy thống kê số lượng hồ sơ theo trạng thái
 */
export const getApplicationStatsByStatus = async () => {
  try {
    // Lấy tất cả dữ liệu hồ sơ
    const response = await axios.get(`${API_URL}/ho_so`);
    const applications = response.data as HoSoType[];
    
    // Tạo thống kê từ dữ liệu
    const statusStats: Record<string, number> = {
      'cho_duyet': 0,
      'da_duyet': 0,
      'tu_choi': 0
    };
    
    // Đếm số lượng hồ sơ theo trạng thái
    applications.forEach(app => {
      if (app.trang_thai) {
        statusStats[app.trang_thai] = (statusStats[app.trang_thai] || 0) + 1;
      }
    });
    
    // Chuyển đổi thành dạng mảng với tên trạng thái
    const statusLabels: Record<string, string> = {
      'cho_duyet': 'Chờ duyệt',
      'da_duyet': 'Đã duyệt',
      'tu_choi': 'Từ chối'
    };
    
    const result: ApplicationStatType[] = Object.keys(statusStats).map(status => ({
      key: status,
      name: statusLabels[status] || status,
      value: statusStats[status]
    }));
    
    return {
      success: true,
      message: 'Lấy thống kê hồ sơ theo trạng thái thành công',
      data: result,
    };
  } catch (error) {
    console.error('Lỗi khi lấy thống kê theo trạng thái:', error);
    return {
      success: false,
      message: 'Có lỗi xảy ra khi kết nối đến máy chủ',
      data: [],
    };
  }
};

/**
 * Tìm kiếm hồ sơ theo từ khóa
 */
export const searchApplications = async (keyword: string) => {
  try {
    // Lấy tất cả hồ sơ và lọc ở client
    const response = await axios.get(`${API_URL}/ho_so`);
    const applications = response.data as HoSoType[];
    
    const searchLower = keyword.toLowerCase();
    const filteredData = applications.filter(app => 
      app.ho_ten.toLowerCase().includes(searchLower) ||
      app.email.toLowerCase().includes(searchLower) ||
      app.so_cccd.toLowerCase().includes(searchLower) ||
      app.sdt.includes(keyword)
    );
    
    return {
      success: true,
      message: 'Tìm kiếm hồ sơ thành công',
      data: filteredData,
    };
  } catch (error) {
    return {
      success: false,
      message: 'Có lỗi xảy ra khi kết nối đến máy chủ',
      data: [],
    };
  }
}; 