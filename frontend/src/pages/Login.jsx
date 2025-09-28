// import { useContext, useState, useEffect, useRef } from "react";
// import { toast } from "react-toastify";
// import { FaArrowLeft } from "react-icons/fa";
// import axios from "axios";
// import { useNavigate, useLocation } from "react-router-dom";
// import { AppContext } from "../context/AppContext";

// const Login = () => {
//   const { backendUrl, setIsLogged, getUserData } = useContext(AppContext);
//   const [data, setData] = useState({ name: "", email: "", password: "" });
//   const navigate = useNavigate();
//   const location = useLocation();
//   const [photo, setPhoto] = useState(null);
//   const [photoPreview, setPhotoPreview] = useState("");
//   const fileInputRef = useRef(null);
//   const [formType, setFormType] = useState("login");
//   const [isLoading, setIsLoading] = useState(false);

//   // Detect route change and set form type
//   useEffect(() => {
//     if (location.pathname === "/signup") {
//       setFormType("signup");
//     } else {
//       setFormType("login");
//     }
//   }, [location.pathname]);

//   const toastIdAll = "fields-required";
//   const nameToastId = "missing-name";
//   const emailToastId = "missing-email";
//   const passwordToastId = "missing-password";

//   const handleChange = (e) => {
//     setData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
//   };

//   const handlePhotoChange = (e) => {
//     const file = e.target.files[0];
//     console.log(file, "File !")
//     if (file) {
//       // Validate file type and size
//       if (!file.type.match("image.*")) {
//         toast.error("Please select an image file");
//         return;
//       }
//       if (file.size > 5 * 1024 * 1024) { // 5MB limit
//         toast.error("Image size should be less than 5MB");
//         return;
//       }
//       setPhoto(file);
//       setPhotoPreview(URL.createObjectURL(file));
//     }
//   };

//   const handleLogin = async (e) => {
//     e.preventDefault();

//     const isLoginEmpty = formType === "login" && !data.email && !data.password;
//     const isSignupEmpty =
//       formType === "signup" && !data.name && !data.email && !data.password;

//     if (isLoginEmpty || isSignupEmpty) {
//       if (!toast.isActive(toastIdAll)) {
//         toast.error("All fields are required!", { toastId: toastIdAll });
//       }
//       setIsLoading(false);
//       return;
//     }

//     if (formType === "signup" && !data.name && !toast.isActive(nameToastId)) {
//       toast.error("Name is required!", { toastId: nameToastId });
//       return;
//     }

//     if (!data.email && !toast.isActive(emailToastId)) {
//       toast.error("Email is required!", { toastId: emailToastId });
//       return;
//     }

//     if (!data.password && !toast.isActive(passwordToastId)) {
//       toast.error("Password is required!", { toastId: passwordToastId });
//       return;
//     }

//     try {
//       if (formType === "login") {
//         const res = await axios.post(`${backendUrl}/api/login`, data, {
//           withCredentials: true,
//         });

//         if (res.data.success) {
//           setIsLogged(true);
//           await getUserData();
//           toast.success("Login Successful!");
//           localStorage.setItem('justSignedUp', 'true');
//           navigate("/");
//         } else {
//           toast.error("User not found");
//         }
//       } else {
//         const formData = new FormData();
//         formData.append("name", data.name);
//         formData.append("email", data.email);
//         formData.append("password", data.password);
//         console.log(photo, "PHOTO")
//         if (photo) {
//           formData.append("photo", photo);
//         }

//         const res = await axios.post(`${backendUrl}/api/register`, formData, {
//           withCredentials: true,
//           headers: {
//             "Content-Type": "multipart/form-data",
//           },
//         });

//         if (res.data.success) {
//           setIsLogged(true);
//           await getUserData();
//           toast.success("User Registered Successfully!");
//           localStorage.setItem('justLoggedIn', 'true');
//           navigate("/");
//         }
//       }
//     } catch (error) {
//       toast.error(
//         error?.response?.data?.message || error.message || "Something went wrong"
//       );
//     }

//     console.log(`${formType.toUpperCase()} DATA`, data);
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-100 px-4">
      
//       <div className="w-full max-w-md bg-white shadow-lg rounded-xl p-8 md:p-10">
    
//         <div className="mb-6">
//           <button
//             onClick={() => navigate("/")}
//             className="flex items-center text-gray-700 hover:text-blue-600 transition text-xl font-bold"
//           >
//             <FaArrowLeft className="mr-2 text-2xl" />
//           </button>
//         </div>

//         {formType === "login" ? (
//           <>
//             <h2 className="text-3xl font-bold text-center text-gray-800 mb-2">Welcome Back 👋</h2>
//             <p className="text-center text-gray-500 mb-8">Login to your account to continue</p>
//           </>
//         ) : (
//           <>
//             <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">Create Account 👤</h2>
//             <p className="text-center text-gray-500 mb-8">Sign up to get started with your journey</p>
//           </>
//         )}

//         <form className="space-y-6">
//           {formType === "signup" && (
//             <div>
//               <label className="block mb-2 text-sm font-medium text-gray-700">Full Name</label>
//               <input
//                 type="text"
//                 name="name"
//                 value={data.name}
//                 onChange={handleChange}
//                 className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
//                 placeholder="Your full name"
//               />

//               <div>
//                 <label className="block mb-2 text-sm font-medium text-gray-700">Profile Photo</label>
//                 <div className="flex items-center space-x-4">
//                   {photoPreview ? (
//                     <img
//                       src={photoPreview}
//                       alt="Preview"
//                       className="w-12 h-12 rounded-full object-cover"
//                     />
//                   ) : (
//                     <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
//                       <span className="text-gray-500 text-xs">No photo</span>
//                     </div>
//                   )}
//                   <button
//                     type="button"
//                     onClick={() => fileInputRef.current.click()}
//                     className="px-3 py-1 text-sm text-blue-600 border border-blue-600 rounded-md hover:bg-blue-50 transition"
//                   >
//                     Choose Photo
//                   </button>
//                   <input
//                     type="file"
//                     ref={fileInputRef}
//                     onChange={handlePhotoChange}
//                     accept="image/*"
//                     className="hidden"
//                   />
//                 </div>
//               </div>
//             </div>
//           )}

//           <div>
//             <label className="block mb-2 text-sm font-medium text-gray-700">Email address</label>
//             <input
//               type="email"
//               name="email"
//               value={data.email}
//               onChange={handleChange}
//               className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
//               placeholder="you@example.com"
//             />
//           </div>

//           <div>
//             <label className="block mb-2 text-sm font-medium text-gray-700">Password</label>
//             <input
//               type="password"
//               name="password"
//               value={data.password}
//               onChange={handleChange}
//               className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-400 transition"
//               placeholder="••••••••"
//             />
//           </div>

//           {formType === "login" && (
//             <div className="text-right">
//               <p onClick={() => navigate("/reset-password")} className="text-sm text-blue-600 hover:underline cursor-pointer">
//                 Forgot password?
//               </p>
//             </div>
//           )}

//           <button
//             type="button"
//             onClick={handleLogin}
//             className="w-full py-2 px-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-md shadow-md hover:scale-105 transition duration-300"
//           >
//             {formType === "login" ? "Login" : "Sign Up"}
//           </button>
//         </form>

//         {formType === "login" ? (
//           <p onClick={() => navigate("/signup")} className="text-center text-sm text-gray-500 mt-6 cursor-pointer">
//             Don't have an account? <span className="text-blue-600 hover:underline">Sign up</span>
//           </p>
//         ) : (
//           <p onClick={() => navigate("/login")} className="text-center text-sm text-gray-500 mt-6 cursor-pointer">
//             Already have an account? <span className="text-blue-600 hover:underline">Login</span>
//           </p>
//         )}
//       </div>
//     </div>
//   );
// };

// export default Login;

import { useContext, useState, useEffect, useRef } from "react";
import { toast } from "react-toastify";
import { FaArrowLeft, FaEye, FaEyeSlash, FaUser, FaEnvelope, FaLock, FaCamera, FaTimes } from "react-icons/fa";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import { AppContext } from "../context/AppContext";

const Login = () => {
  const { backendUrl, setIsLogged, getUserData } = useContext(AppContext);
  const [data, setData] = useState({ name: "", email: "", password: "" });
  const navigate = useNavigate();
  const location = useLocation();
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState("");
  const fileInputRef = useRef(null);
  const [formType, setFormType] = useState("login");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Detect route change and set form type
  useEffect(() => {
    if (location.pathname === "/signup") {
      setFormType("signup");
    } else {
      setFormType("login");
    }
  }, [location.pathname]);

  const toastIdAll = "fields-required";
  const nameToastId = "missing-name";
  const emailToastId = "missing-email";
  const passwordToastId = "missing-password";

  const handleChange = (e) => {
    setData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.match("image.*")) {
        toast.error("Please select an image file");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size should be less than 5MB");
        return;
      }
      setPhoto(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const removePhoto = () => {
    setPhoto(null);
    setPhotoPreview("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const isLoginEmpty = formType === "login" && !data.email && !data.password;
    const isSignupEmpty =
      formType === "signup" && !data.name && !data.email && !data.password;

    if (isLoginEmpty || isSignupEmpty) {
      if (!toast.isActive(toastIdAll)) {
        toast.error("All fields are required!", { toastId: toastIdAll });
      }
      setIsLoading(false);
      return;
    }

    if (formType === "signup" && !data.name && !toast.isActive(nameToastId)) {
      toast.error("Name is required!", { toastId: nameToastId });
      setIsLoading(false);
      return;
    }

    if (!data.email && !toast.isActive(emailToastId)) {
      toast.error("Email is required!", { toastId: emailToastId });
      setIsLoading(false);
      return;
    }

    if (!data.password && !toast.isActive(passwordToastId)) {
      toast.error("Password is required!", { toastId: passwordToastId });
      setIsLoading(false);
      return;
    }

    try {
      if (formType === "login") {
        const res = await axios.post(`${backendUrl}/api/login`, data, {
          withCredentials: true,
        });

        if (res.data.success) {
          setIsLogged(true);
          await getUserData();
          toast.success("Login Successful!");
          localStorage.setItem('justLoggedIn', 'true');
          navigate("/");
        } else {
          toast.error("User not found");
        }
      } else {
        const formData = new FormData();
        formData.append("name", data.name);
        formData.append("email", data.email);
        formData.append("password", data.password);
        if (photo) {
          formData.append("photo", photo);
        }

        const res = await axios.post(`${backendUrl}/api/register`, formData, {
          withCredentials: true,
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        if (res.data.success) {
          setIsLogged(true);
          await getUserData();
          toast.success("User Registered Successfully!");
          localStorage.setItem('justSignedUp', 'true');
          navigate("/");
        }
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.message || error.message || "Something went wrong"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 px-4 py-8 relative">
      {/* Sticky Navbar-like Back Button */}
      <div className="fixed top-0 left-0 right-0 h-16 bg-gradient-to-r from-blue-600 to-purple-600 shadow-md z-50 flex items-center px-4">
        <button
          onClick={() => navigate("/")}
          className="flex items-center justify-center w-10 h-10 rounded-lg bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-all duration-300 group"
          aria-label="Go back"
        >
          <FaArrowLeft className="text-white text-lg group-hover:scale-110 transition-transform" />
        </button>
        <div className="ml-4">
          <h2 className="text-white font-semibold">
            {formType === "login" ? "Sign In to Your Account" : "Create New Account"}
          </h2>
        </div>
      </div>

      {/* Main Card */}
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 mt-16">
        {/* Header with gradient */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-center">
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm border-2 border-white/30">
              {formType === "login" ? (
                <FaLock className="text-white text-3xl" />
              ) : (
                <FaUser className="text-white text-3xl" />
              )}
            </div>
          </div>
          
          <h2 className="text-2xl font-bold text-white mb-2">
            {formType === "login" ? "Welcome Back" : "Create Account"}
          </h2>
          <p className="text-blue-100 text-sm">
            {formType === "login" 
              ? "Sign in to continue your journey" 
              : "Join us to get started"
            }
          </p>
        </div>

        {/* Form Section */}
        <div className="p-6 md:p-8">
          <form className="space-y-5">
            {formType === "signup" && (
              <>
                {/* Name Field */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Full Name</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaUser className="text-gray-400" />
                    </div>
                    <input
                      type="text"
                      name="name"
                      value={data.name}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      placeholder="Enter your full name"
                    />
                  </div>
                </div>

                {/* Photo Upload */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Profile Photo</label>
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <div className="w-16 h-16 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden">
                        {photoPreview ? (
                          <>
                            <img
                              src={photoPreview}
                              alt="Preview"
                              className="w-full h-full object-cover"
                            />
                            <button
                              type="button"
                              onClick={removePhoto}
                              className="absolute -top-1 -right-1 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors"
                            >
                              <FaTimes className="text-xs" />
                            </button>
                          </>
                        ) : (
                          <FaUser className="text-gray-400" />
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current.click()}
                        className="absolute -bottom-1 -right-1 bg-blue-600 text-white p-1.5 rounded-full hover:bg-blue-700 transition-colors shadow-md"
                      >
                        <FaCamera className="text-xs" />
                      </button>
                    </div>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handlePhotoChange}
                      accept="image/*"
                      className="hidden"
                    />
                    <span className="text-sm text-gray-500">Optional</span>
                  </div>
                </div>
              </>
            )}

            {/* Email Field */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaEnvelope className="text-gray-400" />
                </div>
                <input
                  type="email"
                  name="email"
                  value={data.email}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="your.email@example.com"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaLock className="text-gray-400" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={data.password}
                  onChange={handleChange}
                  className="w-full pl-10 pr-12 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            {/* Forgot Password */}
            {formType === "login" && (
              <div className="text-right">
                <button
                  type="button"
                  onClick={() => navigate("/reset-password")}
                  className="text-sm text-blue-600 hover:text-blue-700 transition-colors font-medium"
                >
                  Forgot password?
                </button>
              </div>
            )}

            {/* Submit Button */}
            <button
              onClick={handleLogin}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3.5 px-4 rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  {formType === "login" ? "Signing in..." : "Creating account..."}
                </div>
              ) : (
                formType === "login" ? "Sign In" : "Create Account"
              )}
            </button>
          </form>

          {/* Switch Form Type */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              {formType === "login" ? "Don't have an account? " : "Already have an account? "}
              <button
                onClick={() => navigate(formType === "login" ? "/signup" : "/login")}
                className="text-blue-600 font-semibold hover:text-blue-700 transition-colors"
              >
                {formType === "login" ? "Sign up" : "Sign in"}
              </button>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-100">
          <p className="text-xs text-center text-gray-500">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
