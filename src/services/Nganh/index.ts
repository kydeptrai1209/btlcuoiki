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
  cac_mon: string;
}

const API_URL = '/json-server';

/**
 * Lấy danh sách tất cả ngành
 */
export const getAllNganh = async () => {
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
 * Lấy danh sách ngành theo trường
 */
export const getNganhByTruongId = async (truongId: number) => {
  try {
    // Lấy tất cả ngành và lọc theo truong_id phía client
    const response = await axios.get(`${API_URL}/nganh`);
    const nganhList = response.data as NganhType[];
    const filteredNganh = nganhList.filter(nganh => nganh.truong_id === truongId);
    
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
 * Lấy danh sách tổ hợp xét tuyển theo ngành
 */
export const getToHopByNganhId = async (nganhId: number) => {
  try {
    // Lấy tất cả tổ hợp và lọc theo nganh_id phía client
    const response = await axios.get(`${API_URL}/to_hop_xet_tuyen`);
    const toHopList = response.data as ToHopType[];
    const filteredToHop = toHopList.filter(toHop => toHop.nganh_id === nganhId);
    
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
 * Lấy chi tiết ngành theo ID
 */
export const getNganhById = async (id: number) => {
  try {
    const response = await axios.get(`${API_URL}/nganh/${id}`);
    return {
      success: true,
      message: 'Lấy thông tin ngành thành công',
      data: response.data as NganhType,
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
 * Thêm ngành mới
 */
export const addNganh = async (nganhData: Omit<NganhType, 'id'>) => {
  try {
    const response = await axios.post(`${API_URL}/nganh`, nganhData);
    return {
      success: true,
      message: 'Thêm ngành thành công',
      data: response.data as NganhType,
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
    const response = await axios.put(`${API_URL}/nganh/${id}`, nganhData);
    return {
      success: true,
      message: 'Cập nhật thông tin ngành thành công',
      data: response.data as NganhType,
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
 * Cập nhật các tổ hợp xét tuyển của một ngành
 */
export const updateToHopForNganh = async (nganhId: number, toHopList: { ma_to_hop: string; cac_mon: string }[]) => {
  try {
    // 1. Lấy tất cả tổ hợp hiện có của ngành
    const currentToHopResponse = await getToHopByNganhId(nganhId);
    const currentToHops = currentToHopResponse.data;
    
    // 2. Xóa tất cả tổ hợp cũ
    for (const toHop of currentToHops) {
      await deleteToHop(toHop.id);
    }
    
    // 3. Thêm các tổ hợp mới
    const newToHops: ToHopType[] = [];
    for (const toHop of toHopList) {
      const addResult = await addToHop({
        nganh_id: nganhId,
        ma_to_hop: toHop.ma_to_hop,
        cac_mon: toHop.cac_mon,
      });
      
      if (addResult.success && addResult.data) {
        newToHops.push(addResult.data);
      }
    }
    
    return {
      success: true,
      message: 'Cập nhật tổ hợp xét tuyển thành công',
      data: newToHops,
    };
    
  } catch (error) {
    return {
      success: false,
      message: 'Có lỗi xảy ra khi cập nhật tổ hợp xét tuyển',
      data: [],
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