'use client';

import { useState } from 'react';
import { useContactSettings, settingsToMap } from '@/hooks/useWebsiteSettings';
import { useMutation } from '@apollo/client';
import { gql } from '@apollo/client';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Phone, Mail, MapPin, Clock, Send, Facebook, MessageCircle } from 'lucide-react';
import { toast } from 'sonner';

// GraphQL Mutation for contact form
const SEND_CONTACT_MESSAGE = gql`
  mutation SendContactMessage($input: ContactMessageInput!) {
    sendContactMessage(input: $input) {
      success
      message
    }
  }
`;

export default function ContactPage() {
  const { data: contactSettingsRaw = [] } = useContactSettings();
  const contactSettings = settingsToMap(contactSettingsRaw);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });

  const [sendMessage, { loading }] = useMutation(SEND_CONTACT_MESSAGE);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.message) {
      toast.error('Vui lòng điền đầy đủ thông tin');
      return;
    }

    try {
      const { data } = await sendMessage({
        variables: {
          input: formData,
        },
      });

      if (data?.sendContactMessage?.success) {
        toast.success('Gửi tin nhắn thành công! Chúng tôi sẽ liên hệ lại bạn sớm.');
        setFormData({
          name: '',
          email: '',
          phone: '',
          subject: '',
          message: '',
        });
      }
    } catch (error: any) {
      console.error('Send message error:', error);
      toast.error('Có lỗi xảy ra. Vui lòng thử lại sau.');
    }
  };

  // Contact info from settings
  const companyName = contactSettings['company_name']?.value || 'Rau Sạch Trần Gia';
  const companyAddress = contactSettings['company_address']?.value || '123 Đường ABC, Quận XYZ, TP.HCM';
  const companyPhone = contactSettings['company_phone']?.value || '0123 456 789';
  const companyEmail = contactSettings['company_email']?.value || 'info@rausachtrangia.com';
  const companyHours = contactSettings['business_hours']?.value || 'Thứ 2 - CN: 7:00 - 22:00';
  const facebookUrl = contactSettings['facebook_url']?.value || 'https://facebook.com';
  const zaloPhone = contactSettings['zalo_phone']?.value || companyPhone;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 md:py-12">
        
        {/* About Us Section */}
        <div className="mb-12">
          <Card>
            <CardContent className="p-6 md:p-8">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">Về Chúng Tôi</h2>
              
              <div className="prose prose-lg max-w-none">
                {/* Company Image - Placeholder */}
                <div className="mb-6">
                  <div className="w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center">
                    <span className="text-gray-400">Logo/Hình ảnh công ty</span>
                  </div>
                </div>

                <div className="space-y-4 text-gray-700 leading-relaxed">
                  <p className="font-semibold text-gray-900">
                    Kính gửi: Quý Khách Hàng !
                  </p>

                  <p>
                    Hơn <strong>15 năm</strong> giao rau tận nhà cho từng <strong>gia đình</strong>, <strong className="italic">chợ đầu mối</strong>, 
                    Cung cấp rau cho Trung tâm hội nghị tiệc cưới, Cung cấp rau cho các hệ thống nhà hàng và suất ăn công nghiệp,... 
                    Chúng tôi biết cách lựa chọn ra những loại rau tốt nhất theo từng vùng miền, từng mùa được sơ chế phù hợp nhất cho 
                    từng mỗ hình chế biến sản phẩm đầu ra nhằm giảm tối đa hao hụt cho sản phẩm.
                  </p>

                  <p>
                    Bên cạnh đó Chúng tôi phân năo đã hiểu thấu sự khó khăn của khách hàng trong sự bất an về chất lượng hàng hóa phụ 
                    thuộc vào thời tiết, <strong>Vệ Sinh An Toàn Thực Phẩm</strong>. Sự tồn động hóa chất còn sót lại trong những bữa 
                    ăn hàng ngày ... Cũng như quý vị phải tốn nhiều thời gian và công sức để đi mua từng mặt hàng vói chất lượng và giá 
                    cả không ổn định.
                  </p>

                  <p>
                    Chính vì thế, Chúng tôi đã xây dựng và quy hoạch nguồn nguyên liệu đảm bảo nhằm góp phần nhỏ súc lực của mình mang 
                    sự tiên lợi, hài lòng và đặc biệt là nguồn <strong className="italic">thực phẩm an toàn</strong> mà chúng tôi mang 
                    đến cho mọi người.
                  </p>

                  <p className="font-medium">Với lợi thế:</p>

                  <ul className="list-disc pl-6 space-y-2">
                    <li>
                      Nguồn <strong className="italic">rau tại vườn</strong>, giá cả ổn định cho các mặt hàng cho dù thị trường biến động.
                    </li>
                    <li>
                      Hàng hóa luôn đảm bảo mới, <strong className="italic">rau tươi ngon trong ngày</strong> không có hàng tồn, hàng nguội.
                    </li>
                    <li>
                      Nhận lực sản sẵng đáp ứng mọi lúc, mọi nơi với sự nhiêt tình, chuyên nghiệp, vui vé lịch sự.
                    </li>
                    <li>
                      Hàng hóa đã được sơ chế theo yêu cầu, đúng quy cách và đủ số lượng. Nếu không đạt yêu cầu có thể đổi hàng trả lại ngay.
                    </li>
                    <li>
                      Thời gian thanh toán linh hoạt.
                    </li>
                    <li>
                      Xuất hóa đơn tài chính theo yêu cầu.
                    </li>
                    <li>
                      Với mục tiêu không chỉ <strong className="italic">Cung cấp rau sạch</strong> chúng tối luôn đặt dịch vụ và tất cả 
                      vì sự hài lòng của quý khách hàng
                    </li>
                  </ul>

                  <p className="font-medium italic">
                    Thay mặt Công ty TNHH Nông Sản Thực Phẩm Trần Gia xin gửi đến Quý khách hàng lời chào thân ái và hợp tác.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Company System Section */}
        <div className="mb-12">
          <Card>
            <CardContent className="p-6 md:p-8">
              <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-900 mb-8">
                HỆ SINH THÁI NÔNG NGHIỆP TRẦN GIA
              </h2>

              <div className="space-y-8">
                {/* Main Company */}
                <div className="border-l-4 border-green-600 pl-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">CÔNG TY TNHH NÔNG SẢN THỰC PHẨM TRẦN GIA</h3>
                  <div className="space-y-2 text-gray-700">
                    <p>
                      <strong>Địa chỉ:</strong> Tầng 3, Tòa nhà An Phú Plaza, 117-119 Lý Chính Thắng, Phường Võ Thị Sáu, Quận 3, Thành Phố Hồ Chí Minh.
                    </p>
                    <p>
                      <strong>Số giấy phép ĐKKD:</strong> 0313 974 120
                    </p>
                    <p>
                      <strong>Số lời Khoán:</strong> 313 974 120 8
                    </p>
                    <p>
                      <strong>Điện thoại:</strong> <a href="tel:0865770009" className="text-green-600 hover:text-green-700">0865 77 0009</a>
                    </p>
                    <p>
                      <strong>Email:</strong> <a href="mailto:shop.rausachtrangia@gmail.com" className="text-green-600 hover:text-green-700">shop.rausachtrangia@gmail.com</a>
                    </p>
                    <p>
                      <strong>Website:</strong> <a href="https://shop.rausachtrangia.com" target="_blank" rel="noopener noreferrer" className="text-green-600 hover:text-green-700">https://shop.rausachtrangia.com</a>
                      {' • '}
                      <a href="https://facebook.com/rausachtrangia2011" target="_blank" rel="noopener noreferrer" className="text-green-600 hover:text-green-700">facebook.com/rausachtrangia2011</a>
                    </p>
                  </div>
                </div>

                {/* Farm 1 */}
                <div className="border-l-4 border-green-500 pl-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-3">
                    HỢP TÁC XÃ NÔNG NGHIỆP CÔNG NGHỆ CAO TRẦN GIA FARM -
                  </h3>
                  <div className="space-y-2 text-gray-700">
                    <p>
                      <strong>Số giấy phép ĐKKD:</strong> 501 407 000 012
                    </p>
                    <p>
                      <strong>Địa chỉ:</strong> Ấp Hóc Tiều, Xã Mỹ Lộc, Huyện Cần Giuộc, Long An
                    </p>
                  </div>
                </div>

                {/* Farm 2 */}
                <div className="border-l-4 border-green-500 pl-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-3">
                    HỢP TÁC XÃ NÔNG NGHIỆP CÔNG NGHỆ CAO TRẦN GIA FARM - CN LÂM ĐỒNG
                  </h3>
                  <div className="space-y-2 text-gray-700">
                    <p>
                      59 Lạc Long Quân, Thị Trấn Liên Nghĩa, Huyện Đức Trọng, Tỉnh Lâm Đồng, Việt Nam.
                    </p>
                  </div>
                </div>

                {/* Warehouse System */}
                <div className="mt-8">
                  <h3 className="text-xl font-bold text-center text-gray-900 mb-6">HỆ THỐNG KHO SƠ CHẾ:</h3>
                  
                  <div className="space-y-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-bold text-gray-900 mb-2">KHO SƠ CHẾ I:</h4>
                      <p className="text-gray-700">Ấp Hóc Tiều, Xã Mỹ Lộc, Huyện Cần Giuộc, Long An</p>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-bold text-gray-900 mb-2">KHO SƠ CHẾ II:</h4>
                      <p className="text-gray-700">61 Lạc Long Quân, Thị Trấn Liên Nghĩa, Huyện Đức Trọng, Tỉnh Lâm Đồng, Việt Nam.</p>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-bold text-gray-900 mb-2">KHO SƠ CHẾ III:</h4>
                      <p className="text-gray-700">Địa chỉ: 30 Kha Vạn Cận, P. Hiệp Bình Chánh, TP Thủ Đức, Hồ Chí Minh</p>
                    </div>
                  </div>
                </div>

                {/* Contact Info Cards */}
                <div className="mt-8">
                  <h3 className="text-xl font-bold text-center text-gray-900 mb-6">Thông Tin Liên Hệ</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Address Card */}
                    <div className="bg-gray-50 p-6 rounded-lg text-center">
                      <div className="flex justify-center mb-4">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                          <MapPin className="w-8 h-8 text-green-600" />
                        </div>
                      </div>
                      <h4 className="font-bold text-gray-900 mb-3">Địa Chỉ Của Chúng Tôi</h4>
                      <p className="text-sm text-gray-700">
                        Tầng 3, Tòa nhà An Phú Plaza, 117-119 Lý Chính Thắng, Phường Võ Thị Sáu, Quận 3, TP.HCM
                      </p>
                    </div>

                    {/* Contact Card */}
                    <div className="bg-gray-50 p-6 rounded-lg text-center">
                      <div className="flex justify-center mb-4">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                          <Phone className="w-8 h-8 text-green-600" />
                        </div>
                      </div>
                      <h4 className="font-bold text-gray-900 mb-3">Liên Hệ</h4>
                      <div className="space-y-1 text-sm text-gray-700">
                        <p>
                          <a href="tel:0865770009" className="text-green-600 hover:text-green-700">0865770009</a>
                        </p>
                        <p>
                          <a href="mailto:rausachtrangia@gmail.com" className="text-green-600 hover:text-green-700">rausachtrangia@gmail.com</a>
                        </p>
                      </div>
                    </div>

                    {/* Hours Card */}
                    <div className="bg-gray-50 p-6 rounded-lg text-center">
                      <div className="flex justify-center mb-4">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                          <Clock className="w-8 h-8 text-green-600" />
                        </div>
                      </div>
                      <h4 className="font-bold text-gray-900 mb-3">Giờ Mở Cửa</h4>
                      <p className="text-sm text-gray-700">
                        Thứ hai - Thứ sáu 8:00 AM - 5:00 PM
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Contact Form & Map Section */}
        <div className="mb-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Contact Form */}
            <div>
              <Card className="h-full">
                <CardContent className="p-6 md:p-8">
                  <div className="text-center mb-6">
                    <p className="text-sm text-gray-600 mb-2">Liên Hệ</p>
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Thông Tin Liên Lạc</h2>
                  </div>
                  
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <Input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Họ Tên"
                        required
                        className="bg-white"
                      />
                    </div>
                    
                    <div>
                      <Input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="Email"
                        required
                        className="bg-white"
                      />
                    </div>

                    <div>
                      <Input
                        type="text"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        placeholder="Chủ Đề"
                        className="bg-white"
                      />
                    </div>

                    <div>
                      <Textarea
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        placeholder="Nội dung"
                        rows={6}
                        required
                        className="bg-white"
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={loading}
                      className="bg-red-600 hover:bg-red-700 text-white font-medium py-3 rounded-full"
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Đang gửi...
                        </>
                      ) : (
                        'Gửi Thông Tin'
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Map */}
            <div>
              <Card className="h-full">
                <CardContent className="p-0 h-full">
                  <div className="h-[600px] rounded-lg overflow-hidden">
                    <iframe
                      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.1234567890!2d106.70709131533427!3d10.783456092312355!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752f1c59c4591f%3A0x822e5d5fecb6a52a!2zVMOgbmcgMywgVMOyYSBuaMOgIEFuIFBow7ogUGxhemEsIDExNy0xMTkgTMO9IENow61uaCBUaOG6r25nLCBQaMaw4budbmcgVsO1IFRo4buLIFPDoXUsIFF14bqtbiAzLCBI4buTIENow60gTWluaA!5e0!3m2!1svi!2s!4v1635000000000!5m2!1svi!2s"
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      allowFullScreen
                      loading="lazy"
                      title="Bản đồ vị trí công ty"
                      className="w-full h-full"
                    ></iframe>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Old sections - Remove or keep for reference */}
        <div className="hidden">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 space-y-6">
              {/* Company Info */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">THÔNG TIN LIÊN HỆ</h3>
                
                <div className="space-y-4">
                  {/* Address */}
                  <div className="flex gap-3">
                    <MapPin className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" />
                    <div>
                      <p className="font-medium text-gray-900">{companyName}</p>
                      <p className="text-sm text-gray-600">{companyAddress}</p>
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="flex gap-3">
                    <Phone className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" />
                    <div>
                      <p className="font-medium text-gray-900">Hotline</p>
                      <a href={`tel:${companyPhone}`} className="text-sm text-green-600 hover:text-green-700">
                        {companyPhone}
                      </a>
                    </div>
                  </div>

                  {/* Email */}
                  <div className="flex gap-3">
                    <Mail className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" />
                    <div>
                      <p className="font-medium text-gray-900">Email</p>
                      <a href={`mailto:${companyEmail}`} className="text-sm text-green-600 hover:text-green-700">
                        {companyEmail}
                      </a>
                    </div>
                  </div>

                  {/* Hours */}
                  <div className="flex gap-3">
                    <Clock className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" />
                    <div>
                      <p className="font-medium text-gray-900">Giờ làm việc</p>
                      <p className="text-sm text-gray-600">{companyHours}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Social Links */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">KẾT NỐI VỚI CHÚNG TÔI</h3>
                
                <div className="space-y-3">
                  <a
                    href={facebookUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                  >
                    <Facebook className="w-5 h-5 text-blue-600" />
                    <span className="font-medium text-blue-600">Facebook</span>
                  </a>

                  <a
                    href={`https://zalo.me/${zaloPhone.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                  >
                    <MessageCircle className="w-5 h-5 text-blue-600" />
                    <span className="font-medium text-blue-600">Zalo</span>
                  </a>
                </div>
              </CardContent>
            </Card>

            {/* Quick Contact */}
            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-6">
                <h3 className="text-lg font-bold text-green-800 mb-3">LIÊN HỆ NHANH</h3>
                <p className="text-sm text-gray-700 mb-4">
                  Cần tư vấn ngay? Gọi hotline để được hỗ trợ trực tiếp
                </p>
                <a
                  href={`tel:${companyPhone}`}
                  className="block w-full text-center bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg transition-colors"
                >
                  <Phone className="w-4 h-4 inline-block mr-2" />
                  {companyPhone}
                </a>
              </CardContent>
            </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
