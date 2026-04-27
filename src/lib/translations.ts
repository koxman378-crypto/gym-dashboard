export type Lang = "en" | "mm";

const translations = {
  nav: {
    users: { en: "Users", mm: "အသုံးပြုသူများ" },
    gymProfile: { en: "Gym Profile", mm: "ဂျင်မ် ပရိုဖိုင်" },
    faqs: { en: "FAQs", mm: "မေးလေ့မေးထရှိသောမေးခွန်းများ" },
    expiryPresets: { en: "Expiry Presets", mm: "သက်တမ်းကြိုသတ်မှတ်ချက်များ" },
    gymPrices: { en: "Gym Prices", mm: "ဂျင်မ် စျေးနှုန်းများ" },
    otherServices: { en: "Other Services", mm: "အခြားဝန်ဆောင်မှုများ" },
    trainerFees: { en: "Trainer Fees", mm: "သင်တန်းဆရာကြေး" },
    subscriptions: { en: "Subscriptions", mm: "အသင်းဝင်မှတ်တမ်းများ" },
    mySubscriptions: { en: "My Subscriptions", mm: "ကျွန်ုပ်၏ မှတ်တမ်းများ" },
    attendance: { en: "Attendance", mm: "တက်ရောက်မှုမှတ်တမ်း" },
    attendanceHistory: {
      en: "Attendance History",
      mm: "တက်ရောက်မှု မှတ်တမ်းများ",
    },
    measurements: { en: "Measurements", mm: "ခန္ဓာကိုယ်တိုင်းတာမှု" },
    settings: { en: "Settings", mm: "ဆက်တင်များ" },
    logout: { en: "Logout", mm: "ထွက်ခွာမည်" },
    loggingOut: { en: "Logging out...", mm: "ထွက်နေသည်..." },
    dashboard: { en: "Dashboard", mm: "ဒက်ရှ်ဘုတ်" },
    notifications: { en: "Notifications", mm: "အသိပေးချက်များ" },
    paymentRequests: { en: "Payment Requests", mm: "ငွေပေးချေမှု တောင်းဆိုချက်များ" },
  },
  gymPrices: {
    title: { en: "Gym Prices", mm: "ဂျင်မ် စျေးနှုန်းများ" },
    subtitle: {
      en: "Create flat gym fee items with amount, duration and promotion.",
      mm: "ပမာဏ၊ ကြာချိန်နှင့် ပရိုမိုးရှင်းဖြင့် ဂျင်မ် ကြေးနှုန်းများ သတ်မှတ်ပါ။",
    },
    addFee: { en: "Add Fee", mm: "ကြေးနှုန်း ထည့်မည်" },
    noFees: { en: "No gym fees found", mm: "ဂျင်မ် ကြေးနှုန်း မတွေ့ပါ" },
  },
  otherServices: {
    title: { en: "Other Services", mm: "အခြားဝန်ဆောင်မှုများ" },
    subtitle: {
      en: "Create service items with day, month, and year prices.",
      mm: "နေ့၊ လ နှင့် နှစ် စျေးနှုန်းဖြင့် ဝန်ဆောင်မှုများ သတ်မှတ်ပါ။",
    },
    addService: { en: "Add Service", mm: "ဝန်ဆောင်မှု ထည့်မည်" },
  },
  trainerFees: {
    title: {
      en: "Trainer Fee Management",
      mm: "သင်တန်းဆရာ ကြေးနှုန်း စီမံခန့်ခွဲမှု",
    },
    subtitle: {
      en: "One trainer has one fee amount only.",
      mm: "သင်တန်းဆရာတစ်ဦးသည် ကြေးနှုန်းတစ်ခုသာ ရှိသည်။",
    },
    noTrainers: { en: "No Trainers Found", mm: "သင်တန်းဆရာ မတွေ့ပါ" },
    noTrainersHint: {
      en: "Create trainers in the staff management section first",
      mm: "ဦးစွာ ဝန်ထမ်းစီမံခန့်ခွဲမှုတွင် သင်တန်းဆရာများ ဖန်တီးပါ",
    },
    loading: { en: "Loading...", mm: "ခဏစောင့်ပါ..." },
  },
  faqs: {
    title: { en: "FAQs", mm: "မေးလေ့မေးထရှိသောမေးခွန်းများ" },
    subtitle: {
      en: "Manage frequently asked questions displayed to gym members.",
      mm: "ဂျင်မ် အဖွဲ့ဝင်များသို့ ပြသသော မေးခွန်းများ စီမံခန့်ခွဲပါ။",
    },
    addFaq: { en: "Add FAQ", mm: "မေးခွန်း ထည့်မည်" },
  },
  expiryPresets: {
    title: { en: "Expiry Presets", mm: "သက်တမ်းကြိုသတ်မှတ်ချက်များ" },
    subtitle: {
      en: "Manage preset values used in the subscription expiry filter dropdown.",
      mm: "အသင်းဝင်မှတ်တမ်း သက်တမ်းစစ်ထုတ်မှုတွင် သုံးသော ကြိုသတ်မှတ်ချက်များ စီမံပါ။",
    },
    addPreset: { en: "Add Preset", mm: "ကြိုသတ်မှတ်ချက် ထည့်မည်" },
  },
  users: {
    title: { en: "Users Management", mm: "အသုံးပြုသူများ စီမံခန့်ခွဲမှု" },
    subtitleOwner: {
      en: "Manage all users, staff, and customers",
      mm: "အသုံးပြုသူများ၊ ဝန်ထမ်းများနှင့် ဖောက်သည်များ စီမံခန့်ခွဲပါ",
    },
    subtitleTrainer: {
      en: "Manage your assigned customers",
      mm: "သင်၏ ဖောက်သည်များ စီမံခန့်ခွဲပါ",
    },
  },
  subscriptions: {
    title: { en: "Subscriptions", mm: "အသင်းဝင်မှတ်တမ်းများ" },
    subtitleOwner: {
      en: "Manage member subscriptions and renewals",
      mm: "အဖွဲ့ဝင် မှတ်တမ်းများနှင့် သက်တမ်းတိုးမှုများ စီမံပါ",
    },
    subtitleTrainer: {
      en: "View subscriptions linked to your trainer account",
      mm: "သင်၏ အကောင့်နှင့် ချိတ်ဆက်ထားသော မှတ်တမ်းများ ကြည့်ရှုပါ",
    },
    create: { en: "Create Subscription", mm: "မှတ်တမ်း ဖန်တီးမည်" },
    noData: { en: "No subscriptions found.", mm: "အသင်းဝင်မှတ်တမ်း မတွေ့ပါ။" },
  },
  attendance: {
    title: { en: "My Attendance", mm: "ကျွန်ုပ်၏ တက်ရောက်မှုမှတ်တမ်း" },
    subtitle: {
      en: "Track your gym attendance and workout sessions",
      mm: "ဂျင်မ် တက်ရောက်မှုနှင့် လေ့ကျင့်ခန်း အချိန်များ ခြေရာခံပါ",
    },
    myMeasurements: { en: "My Measurements", mm: "ကျွန်ုပ်၏ တိုင်းတာမှုများ" },
    history: { en: "Attendance History", mm: "တက်ရောက်မှု မှတ်တမ်းများ" },
    noRecords: {
      en: "No attendance records found. Check in to start tracking your sessions.",
      mm: "တက်ရောက်မှု မှတ်တမ်း မတွေ့ပါ။ ဝင်ရောက်ကြောင်း မှတ်တမ်းတင်ပြီး စတင်ပါ။",
    },
    prev: { en: "Previous", mm: "နောက်သို့" },
    next: { en: "Next", mm: "ရှေ့သို့" },
  },
  attendanceHistory: {
    title: { en: "Attendance History", mm: "တက်ရောက်မှု မှတ်တမ်းများ" },
    subtitle: {
      en: "View attendance calendar for each member",
      mm: "အဖွဲ့ဝင်တစ်ဦးချင်းစီ၏ တက်ရောက်မှု ပြက္ခဒိန် ကြည့်ရှုပါ",
    },
    selectUser: {
      en: "Select a member to view their attendance calendar",
      mm: "တက်ရောက်မှု ပြက္ခဒိန် ကြည့်ရန် အဖွဲ့ဝင်တစ်ဦးကို ရွေးချယ်ပါ",
    },
    noMembers: { en: "No members found", mm: "အဖွဲ့ဝင် မတွေ့ပါ" },
    checkIn: { en: "Check-in", mm: "ဝင်ရောက်ချိန်" },
    checkOut: { en: "Check-out", mm: "ထွက်ခွာချိန်" },
    duration: { en: "Duration", mm: "ကြာချိန်" },
    minutes: { en: "min", mm: "မိနစ်" },
    status: { en: "Status", mm: "အခြေအနေ" },
    completed: { en: "Completed", mm: "ပြီးဆုံး" },
    autoClosed: { en: "Auto-closed", mm: "အလိုအလျောက် ပိတ်သည်" },
    active: { en: "Active", mm: "တက်ရောက်နေဆဲ" },
    noAttendance: {
      en: "No attendance on this day",
      mm: "ဤနေ့တွင် တက်ရောက်မှု မရှိပါ",
    },
    session: { en: "Session", mm: "အချိန်ကန့်သတ်ချက်" },
    totalDays: { en: "Total Days", mm: "စုစုပေါင်း ရက်" },
    searchMembers: { en: "Search members...", mm: "အဖွဲ့ဝင်များ ရှာဖွေပါ..." },
  },
  measurements: {
    title: {
      en: "Body Measurements History",
      mm: "ခန္ဓာကိုယ် တိုင်းတာမှုမှတ်တမ်း",
    },
    assignedTrainer: {
      en: "Assigned Trainer:",
      mm: "တာဝန်ပေးထားသော သင်တန်းဆရာ -",
    },
  },
  myProfile: {
    title: { en: "Profile Settings", mm: "ပရိုဖိုင် ဆက်တင်များ" },
    subtitle: {
      en: "Manage your personal profile and theme here.",
      mm: "သင်၏ ကိုယ်ရေးကိုယ်တာ ပရိုဖိုင်နှင့် သတ်မှတ်ချက်များ ပြင်ဆင်ပါ။",
    },
    theme: { en: "Theme", mm: "အသွင်အပြင်" },
    saveChanges: { en: "Save Changes", mm: "ပြောင်းလဲမှုများ သိမ်းဆည်းမည်" },
    saving: { en: "Saving...", mm: "သိမ်းနေသည်..." },
    loadingProfile: { en: "Loading profile...", mm: "ပရိုဖိုင် ဖတ်နေသည်..." },
    noChanges: {
      en: "No changes to save",
      mm: "သိမ်းဆည်းရန် ပြောင်းလဲမှု မရှိပါ",
    },
    cancel: { en: "Cancel", mm: "မလုပ်တော့ပါ" },
    logout: { en: "Logout", mm: "ထွက်ခွာမည်" },
    loggingOut: { en: "Logging out...", mm: "ထွက်နေသည်..." },
  },
  gymProfile: {
    title: { en: "Gym Profile", mm: "ဂျင်မ် ပရိုဖိုင်" },
    subtitle: {
      en: "Owner-only gym information and branding",
      mm: "ပိုင်ရှင်သာ ကြည့်ရှုနိုင်သော ဂျင်မ် အချက်အလက်များ",
    },
    editProfile: { en: "Edit Profile", mm: "ပရိုဖိုင် ပြင်ဆင်မည်" },
    saveChanges: { en: "Save Changes", mm: "ပြောင်းလဲမှုများ သိမ်းဆည်းမည်" },
    saving: { en: "Saving...", mm: "သိမ်းနေသည်..." },
    loadingProfile: {
      en: "Loading gym profile...",
      mm: "ဂျင်မ် ပရိုဖိုင် ဖတ်နေသည်...",
    },
    logout: { en: "Logout", mm: "ထွက်ခွာမည်" },
    loggingOut: { en: "Logging out...", mm: "ထွက်နေသည်..." },
  },
  notifications: {
    title: { en: "Notifications", mm: "အသိပေးချက်များ" },
    subtitle: {
      en: "Expiring subscription alerts for all members",
      mm: "ကျန်ငွေ၊ သက်တမ်းကုန်ဆုံးမှုနှင့် အသိပေးချက်များကို ဒီနေရာတွင် စီမံနိုင်ပါသည်။",
    },
    unread: { en: "Unread", mm: "မဖတ်ရသေးသော" },
    all: { en: "All", mm: "အားလုံး" },
    markAllRead: { en: "Mark all read", mm: "အားလုံးကို ဖတ်ပြီးသားအဖြစ် မှတ်ရန်" },
    markRead: { en: "Mark as read", mm: "ဖတ်ပြီးသားအဖြစ် မှတ်ရန်" },
    noNotifications: {
      en: "No notifications",
      mm: "အသိပေးချက် မရှိသေးပါ",
    },
    noUnread: {
      en: "No unread notifications",
      mm: "မဖတ်ရသေးသော အသိပေးချက် မရှိသေးပါ",
    },
    daysLeft: { en: "days left", mm: "ရက်ကျန်" },
    endsToday: { en: "Ends today", mm: "ဒီနေ့ ကုန်ဆုံးမည်" },
    expired: { en: "Expired", mm: "သက်တမ်းကုန်ဆုံးပြီး" },
    typeGymFee: { en: "Gym Fee", mm: "ဂျင်ကြေး" },
    typeTrainer: { en: "Trainer", mm: "သင်တန်းဆရာ" },
    typeService: { en: "Service", mm: "ဝန်ဆောင်မှု" },
    typeSubscription: { en: "Subscription", mm: "အသင်းဝင်မှု" },
    viewAll: { en: "View all notifications", mm: "အားလုံးကြည့်မည်" },
    loading: { en: "Loading...", mm: "ဖတ်နေသည်..." },
    typePaymentOverdue: { en: "Payment Overdue", mm: "ငွေပေးရန် ကျန်ရှိသည်" },
    detailTitle: { en: "Notification Details", mm: "အသိပေးချက်အသေးစိတ်" },
    customer: { en: "Customer", mm: "ဖောက်သည်" },
    item: { en: "Item", mm: "အမျိုးအစား" },
    status: { en: "Status", mm: "အခြေအနေ" },
    date: { en: "Date", mm: "ရက်စွဲ" },
    remainingBalance: { en: "Remaining Balance", mm: "ကျန်ငွေ" },
    viewSubscription: { en: "View Subscription", mm: "အသင်းဝင်မှုကြည့်ရန်" },
    markReadDone: { en: "Marked as read", mm: "ဖတ်ပြီးသားအဖြစ် မှတ်ပြီးပါပြီ" },
  },
} as const;

export type Translations = typeof translations;
export default translations;

