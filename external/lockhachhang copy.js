const express = require('express');
const axios = require('axios');
const cors = require('cors'); // Để xử lý CORS nếu frontend gọi từ domain khác

const app = express();
const port = 3999; // Có thể thay đổi port nếu cần

// Sử dụng CORS middleware
app.use(cors());

// Route để fetch dữ liệu khách hàng
app.get('/fetch-customers', async (req, res) => {
    const config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: 'https://tmtaza.vttechsolution.com/Marketing/FilterCustomer/?handler=LoadataCustomer&Cust_DFrom=1900-01-01&Cust_DTo=1900-01-01&App_DFrom=1900-01-01&App_DTo=1900-01-01&App_TimeDFrom=0&App_TimeDTo=0&App_Status=0&Tab_DFrom=1900-01-01&Tab_DTo=1900-01-01&Tab_service=&Tab_serviceType=&Tab_IsChoose=1&Tab_Insurance=0&TabStatus=2&Treat_DFrom=1900-01-01&Treat_DTo=1900-01-01&Treat_Service=&Treat_ServiceType=&Treat_LastDFrom=1900-01-01&Treat_LastDTo=1900-01-01&TreatStatus=0&PaidCreated_DFrom=1900-01-01&PaidCreated_DTo=1900-01-01&PaidTotalFrom=199000&PaidTotalTo=700000000&PaidStatus=0&CusBranch=%2C3%2C&CusGroup=&CusGender=0&CusAgeFrom=0&CusAgeTo=0&CustBirthF=00-00&CustBirthT=00-00&CusSource=&CusBroker=0&CusCity=0&CusDistrict=NaN&CusCommune=0&CustCarrer=&CustTele=0&CustCareID=0&CustNation=0&CustDFromDef=1900-01-01&CustDToDef=1900-01-01&limit=10000',
        headers: { 
            'Cookie': '.AspNetCore.Culture=c%3Dvi-VN%7Cuic%3Dvi-VN; _ga=GA1.1.941668378.1758092267; _gcl_au=1.1.120484721.1758092267; _fbp=fb.1.1758092267362.943534799637456709; _ga_EQ1B3HG4MM=GS2.1.s1758092268$o1$g0$t1758092549$j60$l0$h0; _ga_P3LS0098CH=GS2.1.s1758092266$o1$g1$t1758093844$j60$l0$h0; _ga_03DY31WEY6=GS2.1.s1758092267$o1$g1$t1758093844$j60$l0$h0; .AspNetCore.Antiforgery.yCr0Ige0lxA=CfDJ8GIbH-VhpftJpEA1TB0VQjEAHW_dKLkzJ3mT7FShq4XD9M6m1Hpu0ktcp-eyP5Sg6tWLe7JE-3o-Ru0VVzuPPTmYrIe0OWiAh3ve4z5CZMkWdHamHaM07VbqeiHHXzuhvapQzAIj-1ligK9fOwqxzDg; .AspNetCore.Session=CfDJ8GIbH%2BVhpftJpEA1TB0VQjFvNJkIvA2qBoeaywZge42nsNTj2MS%2FUBs7wz8O1BZ7nwtz7nLt7sxmhayUdM%2FCrz2TDGj9nHS69zMf0ZB0UE6HLQWWxCa2AQ0%2FKibz%2F%2BZtDiAIHr8EKURZh5kS6O2e4MGwRW3W83CbSrYymLkRkhSc; VTTECH_Menu_SideBarIsHide=false; WebToken=eyJhbGciOiJodHRwOi8vd3d3LnczLm9yZy8yMDAxLzA0L3htbGRzaWctbW9yZSNobWFjLXNoYTI1NiIsInR5cCI6IkpXVCJ9.eyJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy93cy8yMDA1LzA1L2lkZW50aXR5L2NsYWltcy9uYW1lIjoiQ0hJS0lFVCIsImh0dHA6Ly9zY2hlbWFzLm1pY3Jvc29mdC5jb20vd3MvMjAwOC8wNi9pZGVudGl0eS9jbGFpbXMvcm9sZSI6IndlYmFwcCIsImh0dHA6Ly9zY2hlbWFzLnhtbHNvYXAub3JnL3dzLzIwMDUvMDUvaWRlbnRpdHkvY2xhaW1zL25hbWVpZGVudGlmaWVyIjoiY2hpa2lldCIsImV4cCI6MTc1OTkzODgwMCwiaXNzIjoidnR0ZWNoc29sdXRpb24iLCJhdWQiOiJ2dHRlY2hzb2x1dGlvbiJ9.NowFitQR7yCjNumGYmYhM66ST80uEdqek1PzvumMywg',
            'Xsrf-Token': 'CfDJ8GIbH-VhpftJpEA1TB0VQjFjR5scqCpchVheEux_yhrTRPA8aHegnAb0O-QxmSo5HoOJfYwB27_lQnZW7VDNc81b93WcRv0TD4mtJ9R2rEjCqOCh8U47YbKcMC0ozr7K-9spSzXDYC_eTbuWQQIt6kg'
        }
    };

    try {
        const response = await axios.request(config);
        res.json(response.data); // Trả về dữ liệu dưới dạng JSON cho frontend
    } catch (err) {
        res.status(500).json({ error: err.message }); // Trả về lỗi nếu có
    }
});

// Khởi động server
app.listen(port, () => {
    console.log(`Server đang chạy tại http://localhost:${port}`);
});