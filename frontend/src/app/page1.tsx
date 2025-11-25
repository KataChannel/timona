'use client';

import React from 'react';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { siteConfig } from '@/config/site.config';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Sun,
  Moon,
  Star,
  TrendingUp,
  Users,
  Award,
  Coffee,
  Music,
  Calendar,
  MessageSquare,
  Zap,
  Heart,
  Target,
  Sparkles,
  Trophy,
  Gift,
  ThumbsUp,
} from 'lucide-react';

// Mock data - sẽ thay bằng GraphQL queries sau
const mockUser = {
  name: 'Nguyễn Văn A',
  avatar: '/avatars/default.jpg',
  position: 'Senior Developer',
  points: 2450,
  level: 5,
};

const motivationalQuotes = [
  { text: 'Hôm nay là cơ hội để bạn tỏa sáng!', author: 'Anonymous' },
  { text: 'Mỗi ngày là một khởi đầu mới đầy tiềm năng.', author: 'Unknown' },
  { text: 'Thành công bắt đầu từ những bước đi nhỏ hôm nay.', author: 'Confucius' },
  { text: 'Đừng đếm những ngày, hãy làm cho những ngày đáng nhớ!', author: 'Muhammad Ali' },
  { text: 'Đặt kỷ luật lên hàng đầu', author: 'CEO Trần Thị Tố Uyên' },
  { text: 'Dùng tận tâm làm tác phong', author: 'CEO Trần Thị Tố Uyên' },
  { text: 'Lấy tốc độ để dẫn đầu', author: 'CEO Trần Thị Tố Uyên' },
  { text: 'Chọn yêu thương làm gốc rễ', author: 'CEO Trần Thị Tố Uyên' },
  { text: 'Sống biết ơn để hạnh phúc', author: 'CEO Trần Thị Tố Uyên' },
];

const wallOfFame = [
  {
    id: 1,
    name: 'Trần Thị Lan',
    avatar: '👩‍💼',
    achievement: 'Hoàn thành dự án X sớm 2 tuần',
    likes: 24,
    department: 'Product Team',
  },
  {
    id: 2,
    name: 'Lê Văn Minh',
    avatar: '👨‍💻',
    achievement: 'Giải quyết 50+ tickets trong tháng',
    likes: 18,
    department: 'Support Team',
  },
  {
    id: 3,
    name: 'Phạm Thu Hà',
    avatar: '👩‍🎨',
    achievement: 'Thiết kế UI/UX được khách hàng khen ngợi',
    likes: 32,
    department: 'Design Team',
  },
];

const dailyPoll = {
  question: 'Hôm nay bạn hào hứng nhất với điều gì?',
  options: [
    { id: 1, text: 'Dự án mới thú vị', votes: 45 },
    { id: 2, text: 'Team building cuối tuần', votes: 38 },
    { id: 3, text: 'Học kỹ năng mới', votes: 22 },
    { id: 4, text: 'Cà phê miễn phí 😄', votes: 67 },
  ],
};

const companyNews = [
  {
    id: 1,
    title: '🎉 Đạt mốc 1000 khách hàng!',
    description: 'Cảm ơn nỗ lực của toàn team',
    date: 'Hôm nay',
    type: 'success',
  },
  {
    id: 2,
    title: '🏖️ Team Building - Vũng Tàu',
    description: 'Cuối tuần này - Ai tham gia?',
    date: 'T7-CN',
    type: 'event',
  },
  {
    id: 3,
    title: '📚 Workshop: AI & Productivity',
    description: 'Thứ 4, 14:00 - Meeting Room A',
    date: 'Thứ 4',
    type: 'learning',
  },
];

const quickStats = [
  { label: 'Dự án hoàn thành', value: '127', icon: Target, color: 'text-green-500' },
  { label: 'Team members', value: '42', icon: Users, color: 'text-blue-500' },
  { label: 'Customer satisfaction', value: '98%', icon: Heart, color: 'text-pink-500' },
  { label: 'Năng suất tháng này', value: '+23%', icon: TrendingUp, color: 'text-orange-500' },
];

export default function Home() {
  const [selectedVote, setSelectedVote] = React.useState<number | null>(null);
  const [currentQuote, setCurrentQuote] = React.useState(motivationalQuotes[0]); // Default first quote
  const [currentTime, setCurrentTime] = React.useState<Date | null>(null); // Null for SSR
  const [mounted, setMounted] = React.useState(false);
  const router = useRouter();

  // Redirect to configured root path if rootRedirect is set
  useEffect(() => {
    if (siteConfig.rootRedirect && siteConfig.rootRedirect !== '/') {
      router.push(siteConfig.rootRedirect);
    }
  }, [router]);

  // Set random quote only on client side
  React.useEffect(() => {
    setMounted(true);
    setCurrentQuote(
      motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)]
    );
    setCurrentTime(new Date());
  }, []);

  // Update time every second (only on client)
  React.useEffect(() => {
    if (!mounted) return;
    
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, [mounted]);

  const getGreeting = () => {
    if (!currentTime) {
      // Default for SSR
      return { text: 'Chào buổi sáng', icon: Sun };
    }
    
    const hour = currentTime.getHours();
    if (hour < 12) return { text: 'Chào buổi sáng', icon: Sun };
    if (hour < 18) return { text: 'Chào buổi chiều', icon: Sun };
    return { text: 'Chào buổi tối', icon: Moon };
  };

  const greeting = getGreeting();
  const totalVotes = dailyPoll.options.reduce((sum, opt) => sum + opt.votes, 0);

  const handleVote = (optionId: number) => {
    setSelectedVote(optionId);
    // TODO: Send vote to backend
  };

  // Format time safely for SSR
  const formatTime = () => {
    if (!currentTime || !mounted) return '--:--';
    return currentTime.toLocaleTimeString('vi-VN', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatDate = () => {
    if (!currentTime || !mounted) return 'Đang tải...';
    return currentTime.toLocaleDateString('vi-VN', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  // Show loading screen if redirecting
  if (siteConfig.rootRedirect && siteConfig.rootRedirect !== '/' && mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin">
            <div className="h-16 w-16 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
          </div>
          <p className="text-gray-600 text-lg font-medium">
            Đang chuyển hướng tới {siteConfig.rootRedirect}...
          </p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 p-3 sm:p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
        {/* Hero Section - Personalized Greeting */}
        <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0 shadow-xl overflow-hidden">
          <CardContent className="p-4 sm:p-6 md:p-8">
            <div className="flex flex-col lg:flex-row items-start justify-between gap-4 lg:gap-0">
              {/* Left Section - Greeting & Quote */}
              <div className="space-y-3 sm:space-y-4 flex-1 w-full">
                {/* Greeting */}
                <div className="flex items-center gap-2 sm:gap-3">
                  <greeting.icon className="h-8 w-8 sm:h-10 sm:w-10 animate-pulse flex-shrink-0" />
                  <div className="min-w-0">
                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold truncate">
                      {greeting.text}, {mockUser.name}!
                    </h1>
                    <p className="text-blue-100 mt-0.5 sm:mt-1 text-sm sm:text-base">
                      {mockUser.position}
                    </p>
                  </div>
                </div>
                
                {/* Quote Box */}
                <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 sm:p-4 border border-white/30">
                  <div className="flex items-start gap-2 sm:gap-3">
                    <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-300 flex-shrink-0 mt-1" />
                    <div className="min-w-0">
                      <p className="text-base sm:text-lg italic leading-relaxed">
                        "{currentQuote.text}"
                      </p>
                      <p className="text-xs sm:text-sm text-blue-100 mt-1">
                        - {currentQuote.author}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Badges */}
                <div className="flex flex-wrap gap-2 sm:gap-4 items-center">
                  <Badge variant="secondary" className="bg-white/20 text-white hover:bg-white/30">
                    <Zap className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                    Level {mockUser.level}
                  </Badge>
                  <Badge variant="secondary" className="bg-white/20 text-white hover:bg-white/30">
                    <Trophy className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                    {mockUser.points} điểm
                  </Badge>
                </div>
              </div>

              {/* Right Section - Clock */}
              <div className="text-left lg:text-right w-full lg:w-auto lg:ml-4">
                <div className="text-4xl sm:text-5xl md:text-6xl font-bold">
                  {formatTime()}
                </div>
                <div className="text-blue-100 text-sm sm:text-base mt-1">
                  {formatDate()}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {quickStats.map((stat, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm text-muted-foreground truncate">
                      {stat.label}
                    </p>
                    <p className="text-2xl sm:text-3xl font-bold mt-1">
                      {stat.value}
                    </p>
                  </div>
                  <stat.icon className={`h-8 w-8 sm:h-10 sm:w-10 ${stat.color} flex-shrink-0`} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Wall of Fame */}
          <Card className="lg:col-span-2">
            <CardHeader className="pb-3 sm:pb-6">
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <Award className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-500" />
                <span className="truncate">Tường Danh Dự - Tuần Này</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4">
              {wallOfFame.map((person) => (
                <div
                  key={person.id}
                  className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 hover:shadow-md transition-shadow"
                >
                  <div className="text-4xl sm:text-5xl flex-shrink-0">{person.avatar}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-1 sm:gap-2">
                      <h3 className="font-bold text-base sm:text-lg truncate">
                        {person.name}
                      </h3>
                      <Badge variant="outline" className="text-xs">
                        {person.department}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground mt-1 text-sm sm:text-base line-clamp-2">
                      {person.achievement}
                    </p>
                    <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-2 sm:mt-3">
                      <Button variant="ghost" size="sm" className="gap-1 h-8 px-2 sm:px-3">
                        <ThumbsUp className="h-3 w-3 sm:h-4 sm:w-4" />
                        <span className="text-xs sm:text-sm">{person.likes} Likes</span>
                      </Button>
                      <Button variant="ghost" size="sm" className="gap-1 h-8 px-2 sm:px-3">
                        <Gift className="h-3 w-3 sm:h-4 sm:w-4" />
                        <span className="text-xs sm:text-sm hidden sm:inline">Gửi lời chúc</span>
                        <span className="text-xs sm:text-sm sm:hidden">Chúc mừng</span>
                      </Button>
                    </div>
                  </div>
                  <Star className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-500 fill-yellow-500 flex-shrink-0" />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Daily Poll */}
          <Card>
            <CardHeader className="pb-3 sm:pb-6">
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <MessageSquare className="h-5 w-5 sm:h-6 sm:w-6 text-blue-500" />
                <span className="truncate">Poll Hôm Nay</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4">
              <p className="font-medium text-sm sm:text-base">{dailyPoll.question}</p>
              <div className="space-y-2 sm:space-y-3">
                {dailyPoll.options.map((option) => {
                  const percentage = ((option.votes / totalVotes) * 100).toFixed(0);
                  const isSelected = selectedVote === option.id;
                  
                  return (
                    <button
                      key={option.id}
                      onClick={() => handleVote(option.id)}
                      className={`w-full text-left p-2.5 sm:p-3 rounded-lg border-2 transition-all ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex justify-between items-center mb-1.5 sm:mb-2">
                        <span className="font-medium text-sm sm:text-base truncate pr-2">
                          {option.text}
                        </span>
                        <span className="text-xs sm:text-sm text-muted-foreground flex-shrink-0">
                          {percentage}%
                        </span>
                      </div>
                      <Progress value={parseInt(percentage)} className="h-1.5 sm:h-2" />
                      <p className="text-xs text-muted-foreground mt-1">
                        {option.votes} votes
                      </p>
                    </button>
                  );
                })}
              </div>
              {selectedVote && (
                <p className="text-xs sm:text-sm text-green-600 font-medium">
                  ✅ Cảm ơn bạn đã tham gia!
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Company News & Wellness Corner */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Company News */}
          <Card>
            <CardHeader className="pb-3 sm:pb-6">
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-green-500" />
                <span className="truncate">Tin Tức & Sự Kiện</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 sm:space-y-3">
              {companyNews.map((news) => (
                <div
                  key={news.id}
                  className="p-3 sm:p-4 rounded-lg border hover:shadow-md transition-shadow cursor-pointer"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-sm sm:text-base line-clamp-1">
                        {news.title}
                      </h4>
                      <p className="text-xs sm:text-sm text-muted-foreground mt-1 line-clamp-2">
                        {news.description}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-xs flex-shrink-0">
                      {news.date}
                    </Badge>
                  </div>
                </div>
              ))}
              <Button variant="outline" className="w-full text-sm sm:text-base">
                Xem thêm tin tức
              </Button>
            </CardContent>
          </Card>

          {/* Wellness Corner */}
          <Card className="bg-gradient-to-br from-green-50 to-blue-50">
            <CardHeader className="pb-3 sm:pb-6">
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <Coffee className="h-5 w-5 sm:h-6 sm:w-6 text-amber-600" />
                <span className="truncate">Góc Thư Giãn</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4">
              {/* Playlist */}
              <div className="p-3 sm:p-4 bg-white rounded-lg border">
                <div className="flex items-center gap-2 mb-2">
                  <Music className="h-4 w-4 sm:h-5 sm:w-5 text-purple-500 flex-shrink-0" />
                  <h4 className="font-bold text-sm sm:text-base">Playlist Buổi Sáng</h4>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground mb-2 sm:mb-3">
                  Những bản nhạc giúp bạn tập trung và năng động
                </p>
                <Button size="sm" variant="outline" className="w-full text-xs sm:text-sm">
                  🎵 Nghe ngay
                </Button>
              </div>

              {/* Tip */}
              <div className="p-3 sm:p-4 bg-white rounded-lg border">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-500 flex-shrink-0" />
                  <h4 className="font-bold text-sm sm:text-base">Tip Hôm Nay</h4>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  <strong>Pomodoro Technique:</strong> Làm việc 25 phút, nghỉ 5 phút. 
                  Sau 4 lần, nghỉ dài 15-30 phút để não bộ phục hồi.
                </p>
              </div>

              {/* Birthday */}
              <div className="p-3 sm:p-4 bg-white rounded-lg border">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500 flex-shrink-0" />
                  <h4 className="font-bold text-sm sm:text-base">Sinh Nhật Hôm Nay</h4>
                </div>
                <p className="text-xs sm:text-sm">
                  🎂 <strong>Nguyễn Văn B</strong> - HR Team
                </p>
                <Button size="sm" variant="outline" className="w-full mt-2 text-xs sm:text-sm">
                  Gửi lời chúc
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader className="pb-3 sm:pb-6">
            <CardTitle className="text-lg sm:text-xl">Truy Cập Nhanh</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
              <Button 
                variant="outline" 
                className="h-16 sm:h-20 flex-col gap-1 sm:gap-2 p-3 sm:p-4"
              >
                <Users className="h-5 w-5 sm:h-6 sm:w-6" />
                <span className="text-xs sm:text-sm">Danh bạ</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-16 sm:h-20 flex-col gap-1 sm:gap-2 p-3 sm:p-4"
              >
                <Calendar className="h-5 w-5 sm:h-6 sm:w-6" />
                <span className="text-xs sm:text-sm">Lịch họp</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-16 sm:h-20 flex-col gap-1 sm:gap-2 p-3 sm:p-4"
              >
                <Target className="h-5 w-5 sm:h-6 sm:w-6" />
                <span className="text-xs sm:text-sm">Mục tiêu</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-16 sm:h-20 flex-col gap-1 sm:gap-2 p-3 sm:p-4"
              >
                <Gift className="h-5 w-5 sm:h-6 sm:w-6" />
                <span className="text-xs sm:text-sm">Phúc lợi</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}