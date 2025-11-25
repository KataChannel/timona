// File: frontend/src/examples/profile-management.example.tsx
// Examples for using User Profile & Admin Reset Password features

import React from 'react';
import { useMutation, useQuery } from '@apollo/client';
import {
  ADMIN_RESET_PASSWORD,
  UPDATE_PROFILE,
  CHANGE_PASSWORD,
  SET_PASSWORD,
  HAS_PASSWORD,
  GET_ME,
} from '@/lib/graphql/auth-queries';

// Note: Replace toast with your notification library
const toast = {
  success: (msg: string) => console.log('✅', msg),
  error: (msg: string) => console.error('❌', msg),
};

// ============================================================================
// EXAMPLE 1: User Update Profile
// ============================================================================

export function UpdateProfileExample() {
  const [updateProfile, { loading }] = useMutation(UPDATE_PROFILE);

  const handleUpdateProfile = async () => {
    try {
      const { data } = await updateProfile({
        variables: {
          input: {
            firstName: 'Nguyễn',
            lastName: 'Văn A',
            avatar: 'https://example.com/avatar.jpg',
            phone: '+84912345678',
          },
        },
      });

      if (data?.updateProfile) {
        toast.success('Cập nhật hồ sơ thành công!');
        console.log('Updated user:', data.updateProfile);
      }
    } catch (error: any) {
      toast.error(`Lỗi: ${error?.message || 'Cập nhật thất bại'}`);
    }
  };

  return (
    <button onClick={handleUpdateProfile} disabled={loading}>
      {loading ? 'Đang cập nhật...' : 'Cập nhật hồ sơ'}
    </button>
  );
}

// ============================================================================
// EXAMPLE 2: User Change Password
// ============================================================================

export function ChangePasswordExample() {
  const [changePassword, { loading }] = useMutation(CHANGE_PASSWORD);
  const [currentPassword, setCurrentPassword] = React.useState('');
  const [newPassword, setNewPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');

  const handleChangePassword = async () => {
    // Validate inputs
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error('Vui lòng điền đầy đủ thông tin');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('Mật khẩu xác nhận không khớp');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }

    try {
      const { data } = await changePassword({
        variables: {
          input: {
            currentPassword,
            newPassword,
          },
        },
      });

      if (data?.changePassword) {
        toast.success('Mật khẩu đã được thay đổi thành công!');
        // Clear form
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (error: any) {
      toast.error(`Lỗi: ${error?.message || 'Thay đổi mật khẩu thất bại'}`);
    }
  };

  return (
    <form onSubmit={(e) => { e.preventDefault(); handleChangePassword(); }}>
      <input
        type="password"
        placeholder="Mật khẩu hiện tại"
        value={currentPassword}
        onChange={(e) => setCurrentPassword(e.target.value)}
      />
      <input
        type="password"
        placeholder="Mật khẩu mới"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
      />
      <input
        type="password"
        placeholder="Xác nhận mật khẩu"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
      />
      <button type="submit" disabled={loading}>
        {loading ? 'Đang thay đổi...' : 'Thay đổi mật khẩu'}
      </button>
    </form>
  );
}

// ============================================================================
// EXAMPLE 3: Set Password for Social Login Users
// ============================================================================

export function SetPasswordExample() {
  const [setPassword, { loading }] = useMutation(SET_PASSWORD);
  const { data: hasPasswordData } = useQuery(HAS_PASSWORD);
  const [password, setPasswordValue] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');

  const handleSetPassword = async () => {
    if (!password || !confirmPassword) {
      toast.error('Vui lòng điền đầy đủ thông tin');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Mật khẩu xác nhận không khớp');
      return;
    }

    try {
      const { data } = await setPassword({
        variables: {
          input: {
            password,
            confirmPassword,
          },
        },
      });

      if (data?.setPassword) {
        toast.success('Mật khẩu đã được tạo thành công!');
        setPasswordValue('');
        setConfirmPassword('');
      }
    } catch (error: any) {
      toast.error(`Lỗi: ${error?.message || 'Tạo mật khẩu thất bại'}`);
    }
  };

  // Only show this form if user doesn't have password
  if (hasPasswordData?.hasPassword) {
    return <div>Bạn đã có mật khẩu. Sử dụng chức năng thay đổi mật khẩu.</div>;
  }

  return (
    <form onSubmit={(e) => { e.preventDefault(); handleSetPassword(); }}>
      <p>Tạo mật khẩu cho tài khoản của bạn</p>
      <input
        type="password"
        placeholder="Mật khẩu"
        value={password}
        onChange={(e) => setPasswordValue(e.target.value)}
      />
      <input
        type="password"
        placeholder="Xác nhận mật khẩu"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
      />
      <button type="submit" disabled={loading}>
        {loading ? 'Đang tạo...' : 'Tạo mật khẩu'}
      </button>
    </form>
  );
}

// ============================================================================
// EXAMPLE 4: Admin Reset Password
// ============================================================================

export function AdminResetPasswordExample() {
  const [resetPassword, { loading }] = useMutation(ADMIN_RESET_PASSWORD);
  const [userId, setUserId] = React.useState('');
  const [newPassword, setNewPassword] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);

  const handleResetPassword = async () => {
    if (!userId) {
      toast.error('Vui lòng chọn người dùng');
      return;
    }

    try {
      const { data } = await resetPassword({
        variables: {
          input: { userId },
        },
      });

      if (data?.adminResetPassword?.success) {
        setNewPassword(data.adminResetPassword.newPassword);
        setShowPassword(true);
        toast.success('Reset mật khẩu thành công!');
        
        // Copy to clipboard
        navigator.clipboard.writeText(data.adminResetPassword.newPassword);
        toast.success('Mật khẩu đã được copy vào clipboard!');
      }
    } catch (error: any) {
      toast.error(`Lỗi: ${error?.message || 'Reset mật khẩu thất bại'}`);
      setNewPassword('');
    }
  };

  return (
    <div>
      <h2>Admin - Reset Mật khẩu Người dùng</h2>
      
      <div>
        <label>Chọn người dùng:</label>
        <input
          type="text"
          placeholder="User ID (UUID)"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
        />
      </div>

      <button onClick={handleResetPassword} disabled={loading}>
        {loading ? 'Đang reset...' : 'Reset Mật khẩu'}
      </button>

      {showPassword && (
        <div style={{ 
          marginTop: '20px', 
          padding: '15px', 
          backgroundColor: '#f0f0f0',
          borderRadius: '4px'
        }}>
          <p><strong>✅ Mật khẩu mới:</strong></p>
          <code style={{ fontSize: '16px', fontWeight: 'bold', color: '#d32f2f' }}>
            {newPassword}
          </code>
          <p style={{ marginTop: '10px', fontSize: '12px', color: '#666' }}>
            ⚠️ Gửi mật khẩu này cho người dùng qua kênh an toàn<br/>
            ⚠️ Người dùng nên đổi mật khẩu ngay sau khi đăng nhập
          </p>
          <button 
            onClick={() => {
              navigator.clipboard.writeText(newPassword);
              toast.success('Copied!');
            }}
          >
            📋 Copy Mật khẩu
          </button>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// EXAMPLE 5: Get Current User Profile
// ============================================================================

export function UserProfileDisplay() {
  const { data, loading, error } = useQuery(GET_ME);

  if (loading) return <div>Đang tải...</div>;
  if (error) return <div>Lỗi: {error.message}</div>;

  const user = data?.getMe;

  return (
    <div>
      <h2>Hồ sơ Người dùng</h2>
      <div>
        <p><strong>Email:</strong> {user?.email}</p>
        <p><strong>Tên đăng nhập:</strong> {user?.username}</p>
        <p><strong>Họ:</strong> {user?.firstName}</p>
        <p><strong>Tên:</strong> {user?.lastName}</p>
        <p><strong>Điện thoại:</strong> {user?.phone}</p>
        <p><strong>Vai trò:</strong> {user?.roleType}</p>
        <p><strong>Trạng thái:</strong> {user?.isActive ? '✅ Hoạt động' : '❌ Bị khóa'}</p>
        <p><strong>Xác thực:</strong> {user?.isVerified ? '✅ Đã xác thực' : '❌ Chưa xác thực'}</p>
      </div>
    </div>
  );
}

// ============================================================================
// EXAMPLE 6: Check Has Password Query
// ============================================================================

export function CheckHasPasswordExample() {
  const { data, loading, error } = useQuery(HAS_PASSWORD);

  if (loading) return <div>Kiểm tra...</div>;
  if (error) return <div>Lỗi: {error.message}</div>;

  const hasPassword = data?.hasPassword;

  return (
    <div>
      {hasPassword ? (
        <p>✅ Bạn đã có mật khẩu. Có thể thay đổi mật khẩu.</p>
      ) : (
        <p>❌ Bạn chưa có mật khẩu. Tạo mật khẩu ngay!</p>
      )}
    </div>
  );
}

// ============================================================================
// EXAMPLE 7: Complete Profile Management Component
// ============================================================================

export function CompleteProfileManagement() {
  const [tab, setTab] = React.useState<'profile' | 'password' | 'admin'>('profile');

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <button 
          onClick={() => setTab('profile')}
          style={{ 
            fontWeight: tab === 'profile' ? 'bold' : 'normal',
            borderBottom: tab === 'profile' ? '2px solid blue' : 'none'
          }}
        >
          Hồ sơ
        </button>
        <button 
          onClick={() => setTab('password')}
          style={{ 
            fontWeight: tab === 'password' ? 'bold' : 'normal',
            borderBottom: tab === 'password' ? '2px solid blue' : 'none'
          }}
        >
          Mật khẩu
        </button>
        <button 
          onClick={() => setTab('admin')}
          style={{ 
            fontWeight: tab === 'admin' ? 'bold' : 'normal',
            borderBottom: tab === 'admin' ? '2px solid blue' : 'none'
          }}
        >
          Admin
        </button>
      </div>

      {tab === 'profile' && (
        <div>
          <h3>Cập nhật Hồ sơ</h3>
          <UpdateProfileExample />
          <hr style={{ margin: '30px 0' }} />
          <h3>Thông tin Hiện tại</h3>
          <UserProfileDisplay />
        </div>
      )}

      {tab === 'password' && (
        <div>
          <h3>Quản lý Mật khẩu</h3>
          <CheckHasPasswordExample />
          <hr style={{ margin: '20px 0' }} />
          <ChangePasswordExample />
          <hr style={{ margin: '30px 0' }} />
          <SetPasswordExample />
        </div>
      )}

      {tab === 'admin' && (
        <div>
          <AdminResetPasswordExample />
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Export default for demo
// ============================================================================

export default CompleteProfileManagement;
