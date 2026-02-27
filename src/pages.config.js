/**
 * pages.config.js - Page routing configuration
 *
 * Pages organized by role/category.
 */
import __Layout from './Layout.jsx';

// Public Pages
import Home from './pages/Public/Home.jsx';
import BookTrial from './pages/Public/BookTrial.jsx';
import BookingFlow from './pages/Public/BookingFlow.jsx';
import CampBrowser from './pages/Public/CampBrowser.jsx';
import CampCatalogue from './pages/Public/CampCatalogue.jsx';
import CourseCatalogue from './pages/Public/CourseCatalogue.jsx';
import ProgramsBrowser from './pages/Public/ProgramsBrowser.jsx';
import CheckoutSuccess from './pages/Public/CheckoutSuccess.jsx';
import Login from './pages/Public/Login.jsx';
import About from './pages/Public/About.jsx';
import Contact from './pages/Public/Contact.jsx';
import PrivacyPolicy from './pages/Public/PrivacyPolicy.jsx';
import TermsOfService from './pages/Public/TermsOfService.jsx';
import Franchising from './pages/Franchising.jsx';
import Parents from './pages/Public/Parents.jsx';

// Student Portal
import StudentPortal from './pages/Student/StudentPortal.jsx';
import MyBookings from './pages/Student/MyBookings.jsx';
import MyChildren from './pages/Student/MyChildren.jsx';
import LearningWorlds from './pages/Student/LearningWorlds.jsx';
import LearningPaths from './pages/Student/LearningPaths.jsx';
import LessonPlayer from './pages/Student/LessonPlayer.jsx';
import EpicModeEditor from './pages/Student/EpicModeEditor.jsx';
import WeeklyClassBooking from './pages/Student/WeeklyClassBooking.jsx';
import KitsuneLesson2D from './pages/Student/KitsuneLesson2D.jsx';

// Parent Portal
import ParentDashboard from './pages/Parent/ParentDashboard.jsx';
import ParentReports from './pages/Parent/ParentReports.jsx';
import FamilyManagement from './pages/Parent/FamilyManagement.jsx';

// Teacher Portal
import TeacherPortal from './pages/Teacher/TeacherPortal.jsx';
import InstructorOnboarding from './pages/Teacher/InstructorOnboarding.jsx';
import InstructorSchedule from './pages/Teacher/InstructorSchedule.jsx';
import ClassManagement from './pages/Teacher/ClassManagement.jsx';
import ClassSchedule from './pages/Teacher/ClassSchedule.jsx';
import CompanionSetup from './pages/Teacher/CompanionSetup.jsx';
import CompanionQAReviewer from './pages/Teacher/CompanionQAReviewer.jsx';

// Owner/Admin Portal
import OwnerDashboard from './pages/Owner/OwnerDashboard.jsx';
import OwnerSettings from './pages/Owner/OwnerSettings.jsx';
import OwnerReports from './pages/Owner/OwnerReports.jsx';
import OwnerStudents from './pages/Owner/OwnerStudents.jsx';
import OwnerCamps from './pages/Owner/OwnerCamps.jsx';
import OwnerSchedule from './pages/Owner/OwnerSchedule.jsx';
import AdminDashboard from './pages/Owner/AdminDashboard.jsx';
import StaffManagement from './pages/Owner/StaffManagement.jsx';
import PermissionMatrix from './pages/Owner/PermissionMatrix.jsx';
import TrialPipeline from './pages/Owner/TrialPipeline.jsx';
import WaitlistDashboard from './pages/Owner/WaitlistDashboard.jsx';
import CreateEvent from './pages/Owner/CreateEvent.jsx';
import BadgeManager from './pages/Owner/BadgeManager.jsx';
import BeaKidFranchise from './pages/Owner/BeaKidFranchise.jsx';

// Content Management
import CurriculumBuilder from './pages/Content/CurriculumBuilder.jsx';
import CurriculumManager from './pages/Content/CurriculumManager.jsx';
import CourseEditor from './pages/Content/CourseEditor.jsx';
import LessonEditor from './pages/Content/LessonEditor.jsx';
import LessonsManager from './pages/Content/LessonsManager.jsx';
import LessonTemplatePage from './pages/Content/LessonTemplatePage.jsx';
import WorldsManager from './pages/Content/WorldsManager.jsx';
import StudentBlockEditor from './pages/Content/StudentBlockEditor.jsx';
import ProjectCreator from './pages/Content/ProjectCreator.jsx';

// Location Management
import Locations from './pages/Locations/Locations.jsx';
import LocationsManager from './pages/Locations/LocationsManager.jsx';
import LocationDetail from './pages/Locations/LocationDetail.jsx';
import LocationCamps from './pages/Locations/LocationCamps.jsx';
import LocationImporter from './pages/Locations/LocationImporter.jsx';
import LocationSelector from './pages/Locations/LocationSelector.jsx';
import WeeklyScheduleManager from './pages/Locations/WeeklyScheduleManager.jsx';

// Analytics & Reports
import Analytics from './pages/Analytics/Analytics.jsx';
import CustomReports from './pages/Analytics/CustomReports.jsx';

// Settings & Utilities
import Settings from './pages/Settings/Settings.jsx';
import EnrollmentsManager from './pages/Settings/EnrollmentsManager.jsx';
import StudentEnrollmentManager from './pages/Settings/StudentEnrollmentManager.jsx';
import WeeklySlotManager from './pages/Settings/WeeklySlotManager.jsx';

// Standalone pages (not yet moved to subfolders)
import FinancialDashboard from './pages/FinancialDashboard.jsx';
import GamificationDemo from './pages/GamificationDemo.jsx';
import HowBeAKidWorks from './pages/HowBeAKidWorks.jsx';
import PWADashboard from './pages/PWADashboard.jsx';
import ProgramsManager from './pages/ProgramsManager.jsx';
import StudentsManager from './pages/StudentsManager.jsx';

export const PAGES = {
  // Public Pages
  "Home": Home,
  "BookTrial": BookTrial,
  "BookingFlow": BookingFlow,
  "CampBrowser": CampBrowser,
  "CampCatalogue": CampCatalogue,
  "CourseCatalogue": CourseCatalogue,
  "ProgramsBrowser": ProgramsBrowser,
  "CheckoutSuccess": CheckoutSuccess,
  "Login": Login,
  "About": About,
  "Contact": Contact,
  "PrivacyPolicy": PrivacyPolicy,
  "TermsOfService": TermsOfService,
  "Franchising": Franchising,
  "Parents": Parents,

  // Student Portal
  "StudentPortal": StudentPortal,
  "MyBookings": MyBookings,
  "MyChildren": MyChildren,
  "LearningWorlds": LearningWorlds,
  "LearningPaths": LearningPaths,
  "LessonPlayer": LessonPlayer,
  "EpicModeEditor": EpicModeEditor,
  "WeeklyClassBooking": WeeklyClassBooking,
  "KitsuneLesson2D": KitsuneLesson2D,

  // Parent Portal
  "ParentDashboard": ParentDashboard,
  "ParentReports": ParentReports,
  "FamilyManagement": FamilyManagement,

  // Teacher Portal
  "TeacherPortal": TeacherPortal,
  "InstructorOnboarding": InstructorOnboarding,
  "InstructorSchedule": InstructorSchedule,
  "ClassManagement": ClassManagement,
  "ClassSchedule": ClassSchedule,
  "CompanionSetup": CompanionSetup,
  "CompanionQAReviewer": CompanionQAReviewer,

  // Owner/Admin Portal
  "OwnerDashboard": OwnerDashboard,
  "OwnerSettings": OwnerSettings,
  "OwnerReports": OwnerReports,
  "OwnerStudents": OwnerStudents,
  "OwnerCamps": OwnerCamps,
  "OwnerSchedule": OwnerSchedule,
  "AdminDashboard": AdminDashboard,
  "StaffManagement": StaffManagement,
  "PermissionMatrix": PermissionMatrix,
  "TrialPipeline": TrialPipeline,
  "WaitlistDashboard": WaitlistDashboard,
  "CreateEvent": CreateEvent,
  "BadgeManager": BadgeManager,
  "BeaKidFranchise": BeaKidFranchise,

  // Content Management
  "CurriculumBuilder": CurriculumBuilder,
  "CurriculumManager": CurriculumManager,
  "CourseEditor": CourseEditor,
  "LessonEditor": LessonEditor,
  "LessonsManager": LessonsManager,
  "LessonTemplatePage": LessonTemplatePage,
  "WorldsManager": WorldsManager,
  "StudentBlockEditor": StudentBlockEditor,
  "ProjectCreator": ProjectCreator,

  // Location Management
  "Locations": Locations,
  "LocationsManager": LocationsManager,
  "LocationDetail": LocationDetail,
  "LocationCamps": LocationCamps,
  "LocationImporter": LocationImporter,
  "LocationSelector": LocationSelector,
  "WeeklyScheduleManager": WeeklyScheduleManager,

  // Analytics & Reports
  "Analytics": Analytics,
  "CustomReports": CustomReports,

  // Settings & Utilities
  "Settings": Settings,
  "EnrollmentsManager": EnrollmentsManager,
  "StudentEnrollmentManager": StudentEnrollmentManager,
  "WeeklySlotManager": WeeklySlotManager,

  // Standalone pages
  "FinancialDashboard": FinancialDashboard,
  "GamificationDemo": GamificationDemo,
  "HowBeAKidWorks": HowBeAKidWorks,
  "PWADashboard": PWADashboard,
  "ProgramsManager": ProgramsManager,
  "StudentsManager": StudentsManager,
};

export const pagesConfig = {
  mainPage: "Home",
  Pages: PAGES,
  Layout: __Layout,
};
