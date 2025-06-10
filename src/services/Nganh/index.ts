import axios from 'axios';

// Interface cho ngành đào tạo
export interface NganhType {
  id: number;
  truong_id: number;
  ma_nganh: string;
  ten_nganh: string;
  mo_ta: string;
}

// Interface cho tổ hợp xét tuyển
export interface ToHopType {
  id: number;
  nganh_id: number;
  ma_to_hop: string;
  ten_to_hop: string;
  cac_mon: string;
  diem_san: number;
  chi_tieu: number;
}

// API URL
const API_URL = '/json-server';

/**
 * Lấy thông tin ngành theo ID
 */
export const getNganhById = async (id: number) => {
  try {
    const response = await axios.get(`${API_URL}/nganh/${id}`);
    // Chuyển đổi ID từ chuỗi sang số
    const nganhWithNumberId = {
      ...response.data,
      id: parseInt(response.data.id, 10),
      truong_id: parseInt(response.data.truong_id, 10)
    };
    
    return {
      success: true,
      message: 'Lấy thông tin ngành thành công',
      data: nganhWithNumberId as NganhType,
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
 * Lấy danh sách ngành theo trường
 */
export const getNganhByTruongId = async (truongId: number) => {
  try {
    // Lấy tất cả ngành và lọc theo truong_id phía client
    const response = await axios.get(`${API_URL}/nganh`);
    const nganhList = response.data as NganhType[];
    
    // Chuyển đổi tất cả ID từ chuỗi sang số
    const nganhListWithNumberIds = nganhList.map(nganh => ({
      ...nganh,
      id: parseInt(String(nganh.id), 10),
      truong_id: parseInt(String(nganh.truong_id), 10)
    }));
    
    // Lọc theo trường ID
    const filteredNganh = nganhListWithNumberIds.filter(nganh => nganh.truong_id === truongId);
    
    return {
      success: true,
      message: 'Lấy danh sách ngành thành công',
      data: filteredNganh,
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
 * Lấy ID số nguyên tiếp theo cho ngành mới
 */
const getNextNganhId = async (): Promise<number> => {
  try {
    const response = await axios.get(`${API_URL}/nganh`);
    const nganhList = response.data;
    
    // Tìm ID cao nhất hiện có
    let maxId = 0;
    nganhList.forEach((nganh: any) => {
      // Chuyển đổi ID sang số nếu có thể
      const numericId = parseInt(nganh.id, 10);
      if (!isNaN(numericId) && numericId > maxId) {
        maxId = numericId;
      }
    });
    
    // Trả về ID tiếp theo
    return maxId + 1;
  } catch (error) {
    console.error('Lỗi khi tạo ID tiếp theo cho ngành:', error);
    // Nếu có lỗi, trả về một ID mặc định đủ lớn để tránh xung đột
    return Math.floor(Date.now() / 1000); // Timestamp hiện tại chia 1000
  }
};

/**
 * Thêm ngành mới
 */
export const addNganh = async (nganhData: Omit<NganhType, 'id'>) => {
  try {
    // Tạo ID số nguyên mới
    const nextId = await getNextNganhId();
    
    // Đảm bảo truong_id là số
    const dataToSend = {
      ...nganhData,
      id: String(nextId), // Chuyển ID thành chuỗi
      truong_id: parseInt(String(nganhData.truong_id), 10)
    };
    
    const response = await axios.post(`${API_URL}/nganh`, dataToSend);
    
    // Đảm bảo ID trong kết quả trả về là số
    const nganhWithNumberId = {
      ...response.data,
      id: parseInt(String(response.data.id), 10),
      truong_id: parseInt(String(response.data.truong_id), 10)
    };
    
    return {
      success: true,
      message: 'Thêm ngành thành công',
      data: nganhWithNumberId as NganhType,
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
 * Cập nhật thông tin ngành
 */
export const updateNganh = async (id: number, nganhData: Omit<NganhType, 'id'>) => {
  try {
    // Đảm bảo truong_id là số
    const dataToSend = {
      ...nganhData,
      id: String(id), // Chuyển ID thành chuỗi
      truong_id: parseInt(String(nganhData.truong_id), 10)
    };
    
    const response = await axios.put(`${API_URL}/nganh/${id}`, dataToSend);
    
    // Đảm bảo ID trong kết quả trả về là số
    const nganhWithNumberId = {
      ...response.data,
      id: parseInt(String(response.data.id), 10),
      truong_id: parseInt(String(response.data.truong_id), 10)
    };
    
    return {
      success: true,
      message: 'Cập nhật thông tin ngành thành công',
      data: nganhWithNumberId as NganhType,
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
 * Xóa ngành
 */
export const deleteNganh = async (id: number) => {
  try {
    await axios.delete(`${API_URL}/nganh/${id}`);
    return {
      success: true,
      message: 'Xóa ngành thành công',
      data: null,
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
 * Lấy danh sách tổ hợp xét tuyển theo ngành
 */
export const getToHopByNganhId = async (nganhId: number) => {
  try {
    const response = await axios.get(`${API_URL}/to_hop_xet_tuyen`);
    const toHopList = response.data as ToHopType[];
    
    // Chuyển đổi ID từ chuỗi sang số
    const toHopListWithNumberIds = toHopList.map(toHop => ({
      ...toHop,
      id: parseInt(String(toHop.id), 10),
      nganh_id: parseInt(String(toHop.nganh_id), 10),
      diem_san: parseFloat(String(toHop.diem_san)),
      chi_tieu: parseInt(String(toHop.chi_tieu), 10)
    }));
    
    // Lọc theo ngành ID
    const filteredToHop = toHopListWithNumberIds.filter(toHop => toHop.nganh_id === nganhId);
    
    return {
      success: true,
      message: 'Lấy danh sách tổ hợp xét tuyển thành công',
      data: filteredToHop,
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
 * Lấy danh sách tổ hợp xét tuyển định sẵn
 */
export const getToHopOptions = async () => {
  // Danh sách tổ hợp xét tuyển cố định
  const toHopOptions = [
    { ma_to_hop: 'A00', cac_mon: 'Toán+Lý+Hóa' },
    { ma_to_hop: 'A01', cac_mon: 'Toán+Lý+Anh' },
    { ma_to_hop: 'B00', cac_mon: 'Toán+Hóa+Sinh' },
    { ma_to_hop: 'C00', cac_mon: 'Văn+Sử+Địa' },
    { ma_to_hop: 'D01', cac_mon: 'Toán+Văn+Anh' },
    { ma_to_hop: 'D07', cac_mon: 'Toán+Hóa+Anh' },
    { ma_to_hop: 'D08', cac_mon: 'Toán+Sinh+Anh' },
    { ma_to_hop: 'D14', cac_mon: 'Văn+Anh+GDCD' },
  ];
  
  return {
    success: true,
    message: 'Lấy danh sách tổ hợp xét tuyển thành công',
    data: toHopOptions,
  };
};

/**
 * Thêm tổ hợp xét tuyển mới
 */
export const addToHop = async (toHopData: Omit<ToHopType, 'id'>) => {
  try {
    const response = await axios.post(`${API_URL}/to_hop_xet_tuyen`, toHopData);
    return {
      success: true,
      message: 'Thêm tổ hợp xét tuyển thành công',
      data: response.data as ToHopType,
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
 * Cập nhật tổ hợp xét tuyển cho ngành
 */
export const updateToHopForNganh = async (nganhId: number, toHopList: { ma_to_hop: string; cac_mon: string }[]) => {
  try {
    // Lấy danh sách tổ hợp hiện có của ngành
    const response = await axios.get(`${API_URL}/to_hop_xet_tuyen`);
    const existingToHops = response.data as ToHopType[];
    const nganhToHops = existingToHops.filter(th => th.nganh_id === nganhId);
    
    // Xóa các tổ hợp hiện có của ngành
    await Promise.all(nganhToHops.map(th => axios.delete(`${API_URL}/to_hop_xet_tuyen/${th.id}`)));
    
    // Thêm các tổ hợp mới
    const nextToHopId = Math.max(...existingToHops.map(th => parseInt(String(th.id), 10)), 0) + 1;
    const newToHopsPromises = toHopList.map((toHop, index) => {
      const toHopData: Omit<ToHopType, 'id'> = {
        nganh_id: nganhId,
        ma_to_hop: toHop.ma_to_hop,
        cac_mon: toHop.cac_mon,
        ten_to_hop: toHop.ma_to_hop, // Sử dụng mã tổ hợp làm tên tổ hợp
        diem_san: 18.0, // Giá trị mặc định
        chi_tieu: 50 // Giá trị mặc định
      };
      
      return axios.post(`${API_URL}/to_hop_xet_tuyen`, {
        id: String(nextToHopId + index), // Chuyển ID thành chuỗi
        ...toHopData
      });
    });
    
    await Promise.all(newToHopsPromises);
    
    return {
      success: true,
      message: 'Cập nhật tổ hợp xét tuyển thành công',
      data: null,
    };
  } catch (error) {
    console.error('Lỗi khi cập nhật tổ hợp xét tuyển:', error);
    return {
      success: false,
      message: 'Có lỗi xảy ra khi kết nối đến máy chủ',
      data: null,
    };
  }
};

/**
 * Xóa tổ hợp xét tuyển
 */
export const deleteToHop = async (id: number) => {
  try {
    await axios.delete(`${API_URL}/to_hop_xet_tuyen/${id}`);
    return {
      success: true,
      message: 'Xóa tổ hợp xét tuyển thành công',
      data: null,
    };
  } catch (error) {
    return {
      success: false,
      message: 'Có lỗi xảy ra khi kết nối đến máy chủ',
      data: null,
    };
  }
}; 