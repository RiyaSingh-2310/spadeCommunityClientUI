export type NavLinkItem =
  | { label: string; path: string }
  | { label: string; action: 'login' | 'signup' };

export const navLinks: NavLinkItem[] = [
  { label: 'Home', path: '/' },
  { label: 'Privacy Policy', path: '/privacy-policy' },
  { label: 'Join', action: 'signup' },
  { label: 'About Us', path: '/about' },
  { label: 'FAQ', path: '/faq' },
  { label: 'Contact', path: '/contact' },
  { label: 'Login', action: 'login' },
];

export const steps = [
  {
    id: 1,
    title: "It's Quick",
    description:
      'Sign up and complete profile questions and get bonus of USD $2.',
    image: '/images/step-quick.svg',
  },
  {
    id: 2,
    title: 'Take Surveys',
    description:
      'Receive survey invitations and complete surveys matching your profile.',
    image: '/images/step-surveys.svg',
  },
  {
    id: 3,
    title: 'Get Rewards',
    description:
      'Earn reward points and redeem them for exciting rewards.',
    image: '/images/step-rewards.svg',
  },
];

export const rewards = [
  { id: 1, name: 'Amazon', logo: '/images/reward-amazon.svg' },
  { id: 2, name: 'Flipkart', logo: '/images/reward-flipkart.svg' },
  { id: 3, name: 'PayPal', logo: '/images/reward-paypal.svg' },
  { id: 4, name: 'UPI', logo: '/images/upi.png' },
  { id: 5, name: 'Bank Transfer', logo: '/images/bank-transfer.png' },
  { id: 6, name: 'Cash Reward', logo: '/images/cash-reward.png' },
];

export const features = [
  {
    id: 1,
    title: 'Fast Registration',
    description: 'Sign up in minutes and start earning rewards right away.',
    icon: 'zap',
  },
  {
    id: 2,
    title: 'Paid Surveys',
    description: 'Get paid for sharing your opinions on topics that matter.',
    icon: 'clipboard',
  },
  {
    id: 3,
    title: 'Secure Platform',
    description: 'Your data is protected with industry-standard security.',
    icon: 'shield',
  },
  {
    id: 4,
    title: 'Global Community',
    description: 'Join millions of members from around the world.',
    icon: 'globe',
  },
  {
    id: 5,
    title: 'Easy Rewards',
    description: 'Redeem points for gift cards, cash, and more.',
    icon: 'gift',
  },
  {
    id: 6,
    title: 'Trusted Research',
    description: 'Partner with leading brands and research companies.',
    icon: 'award',
  },
];

export const statistics = [
  { id: 1, label: 'Total Members', value: 2500000, suffix: '+' },
  { id: 2, label: 'Surveys Completed', value: 15000000, suffix: '+' },
  { id: 3, label: 'Rewards Paid', value: 50000000, suffix: '+' },
  { id: 4, label: 'Countries Served', value: 50, suffix: '+' },
];

export const testimonials = [
  {
    id: 1,
    name: 'Sarah Johnson',
    country: 'United States',
    image: '/images/testimonial-1.jpg',
    rating: 5,
    review:
      'Spade Community has been amazing! I earn gift cards every month just by sharing my opinions on surveys.',
  },
  {
    id: 2,
    name: 'Raj Patel',
    country: 'India',
    image: '/images/testimonial-2.jpg',
    rating: 5,
    review:
      'The registration was quick and easy. I received my first survey invite within days and redeemed my first reward in a week.',
  },
  {
    id: 3,
    name: 'Emma Williams',
    country: 'United Kingdom',
    image: '/images/testimonial-3.jpg',
    rating: 5,
    review:
      'A trusted platform with great rewards. I love how easy it is to redeem points for Amazon gift cards.',
  },
  {
    id: 4,
    name: 'Carlos Mendez',
    country: 'Mexico',
    image: '/images/testimonial-4.jpg',
    rating: 5,
    review:
      'Joining Spade Community was the best decision. Surveys are short, interesting, and the payouts are reliable.',
  },
];

export const faqItems = [
  {
    id: 1,
    question: 'What is Spade Community?',
    answer:
      'Spade Community is an online panel where members share their opinions through surveys and earn rewards for their participation. We connect members with market research opportunities from leading brands worldwide.',
  },
  {
    id: 2,
    question: 'How do I join Spade Community?',
    answer:
      'Joining is free and easy. Simply fill out the registration form with your name, email, and password. Complete your profile to receive survey invitations tailored to your interests.',
  },
  {
    id: 3,
    question: 'How much can I earn?',
    answer:
      'Earnings vary based on the number and type of surveys you complete. Members receive a $2 bonus upon registration and can earn additional rewards for each survey completed.',
  },
  {
    id: 4,
    question: 'What rewards can I redeem?',
    answer:
      'You can redeem your points for a variety of rewards including PayPal cash, Amazon gift cards, Flipkart vouchers, Paytm credits, and more through our reward partners.',
  },
  {
    id: 5,
    question: 'Is my personal information safe?',
    answer:
      'Yes, we take data privacy seriously. Your personal information is protected with industry-standard security measures and is never sold to third parties without your consent.',
  },
  {
    id: 6,
    question: 'How often will I receive survey invitations?',
    answer:
      'Survey invitations depend on your profile and current research needs. Most active members receive several invitations per week. Complete your profile fully to maximize your opportunities.',
  },
];

export const contactInfo = {
  email: 'support@spade-community.com',
  phone: '+91 120 456 7890',
  address:
    'Spade Market Research (P) Ltd, #1108, Ace City, Greater Noida, UP-201306, India',
};

export const footerQuickLinks = [
  { label: 'Home', path: '/' },
  { label: 'About Us', path: '/about' },
  { label: 'Privacy Policy', path: '/privacy-policy' },
  { label: 'FAQ', path: '/faq' },
  { label: 'Contact', path: '/contact' },
];

export const footerCommunityLinks: Array<
  | { label: string; path: string }
  | { label: string; action: 'login' | 'signup' }
> = [
  { label: 'Join', action: 'signup' },
  { label: 'Login', action: 'login' },
  { label: 'Rewards', path: '/#rewards' },
];

export const socialLinks = [
  { name: 'Facebook', url: 'https://facebook.com', icon: 'facebook' },
  { name: 'Twitter', url: 'https://twitter.com', icon: 'twitter' },
  { name: 'LinkedIn', url: 'https://linkedin.com', icon: 'linkedin' },
  { name: 'Instagram', url: 'https://instagram.com', icon: 'instagram' },
];
