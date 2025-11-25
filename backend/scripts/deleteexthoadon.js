const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function deleteExtHoaDon() {
    const extListHoaDonId = process.argv[2];

    if (!extListHoaDonId) {
        console.error('❌ Vui lòng cung cấp ID ext_listhoadon');
        console.log('📝 Sử dụng: node deleteexthoadon.js <extListHoaDonId>');
        console.log('📝 Hoặc: bun deleteexthoadon.js <extListHoaDonId>');
        process.exit(1);
    }

    try {
        console.log('='.repeat(60));
        console.log(`🔍 Đang tìm hóa đơn với ID: ${extListHoaDonId}`);
        console.log('='.repeat(60));

        // Kiểm tra hóa đơn có tồn tại không
        const invoice = await prisma.ext_listhoadon.findUnique({
            where: { id: extListHoaDonId },
            select: {
                id: true,
                idServer: true,
                shdon: true,
                khhdon: true,
                nbten: true,
                nmten: true,
                tgtttbso: true,
            }
        });

        if (!invoice) {
            console.error(`❌ Không tìm thấy hóa đơn với ID: ${extListHoaDonId}`);
            process.exit(1);
        }

        // Hiển thị thông tin hóa đơn
        console.log('\n📄 Thông tin hóa đơn:');
        console.log(`   - ID: ${invoice.id}`);
        console.log(`   - ID Server: ${invoice.idServer || 'N/A'}`);
        console.log(`   - Số hóa đơn: ${invoice.shdon || 'N/A'}`);
        console.log(`   - Ký hiệu: ${invoice.khhdon || 'N/A'}`);
        console.log(`   - Người bán: ${invoice.nbten || 'N/A'}`);
        console.log(`   - Người mua: ${invoice.nmten || 'N/A'}`);
        console.log(`   - Tổng tiền: ${invoice.tgtttbso ? Number(invoice.tgtttbso).toLocaleString() : 'N/A'}`);

        // Đếm số chi tiết
        const detailCount = await prisma.ext_detailhoadon.count({
            where: { idhdonServer: invoice.idServer }
        });

        console.log(`   - Số chi tiết: ${detailCount}`);
        console.log('');

        // Xác nhận xóa
        console.log('⚠️  CẢNH BÁO: Bạn sắp xóa hóa đơn này!');
        console.log('   Hành động này KHÔNG THỂ hoàn tác!');
        console.log('');
        console.log('   Nhấn Ctrl+C để hủy trong 5 giây...');
        
        // Đợi 5 giây
        await new Promise(resolve => setTimeout(resolve, 5000));

        console.log('\n🗑️  Bắt đầu xóa dữ liệu...\n');

        // Xóa chi tiết hóa đơn trước (cascade delete thông qua idServer)
        if (invoice.idServer) {
            const deleteDetails = await prisma.ext_detailhoadon.deleteMany({
                where: { idhdonServer: invoice.idServer }
            });
            console.log(`✅ Đã xóa ${deleteDetails.count} bản ghi ext_detailhoadon`);
        }

        // Xóa hóa đơn chính
        await prisma.ext_listhoadon.delete({
            where: { id: extListHoaDonId }
        });

        console.log(`✅ Đã xóa ext_listhoadon với ID: ${extListHoaDonId}`);
        
        console.log('\n' + '='.repeat(60));
        console.log('🎉 Hoàn thành! Đã xóa thành công.');
        console.log('='.repeat(60));
        
    } catch (error) {
        console.error('\n' + '='.repeat(60));
        console.error('❌ LỖI KHI XÓA DỮ LIỆU');
        console.error('='.repeat(60));
        
        if (error.code === 'P2025') {
            console.error('Hóa đơn không tồn tại hoặc đã bị xóa.');
        } else if (error.code === 'P2003') {
            console.error('Lỗi ràng buộc khóa ngoại. Vui lòng kiểm tra dữ liệu liên quan.');
        } else {
            console.error('Chi tiết lỗi:', error.message);
            if (process.env.DEBUG) {
                console.error('Stack trace:', error.stack);
            }
        }
        
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

deleteExtHoaDon();