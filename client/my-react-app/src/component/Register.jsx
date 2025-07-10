import { Formik, Form, Field } from "formik";
import React, { useState } from "react";
import * as yup from "yup";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const SignupForm = () => {
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  const initialValues = {
    email: "",
    password: "",
    confirmPassword: "",
    phoneNumber: "",
  };

  const validationSchema = yup.object().shape({
    email: yup.string().email("Invalid email").required("Email is required"),
    password: yup
      .string()
      .required("Password is required")
      .min(6, "Password must be at least 6 characters"),
    confirmPassword: yup
      .string()
      .oneOf([yup.ref("password"), null], "Passwords must match")
      .required("Please confirm your password"),
    phoneNumber: yup
      .string()
      .matches(/^[0-9]{10}$/, "Phone number must be 10 digits")
      .required("Phone number is required"),
  });

  const onSubmit = async (values, { setSubmitting }) => {
    try {
      await axios.post("http://localhost:8000/users/userRegistration", {
        email: values.email,
        password: values.password,
        phoneNumber: values.phoneNumber,
      });
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <svg
            width="183"
            height="168"
            viewBox="0 0 184 169"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M47.4155 110L64.9155 115.5" stroke="black" />
            <path
              d="M16 88C76.7315 133.247 117.403 133.671 165 88"
              stroke="#73D83B"
              strokeWidth="4"
            />
            <path
              d="M34.3864 34.3636V42.3182H8.59091V34.3636H34.3864ZM15.0398 78V30.2443C15.0398 27.3087 15.6458 24.8655 16.858 22.9148C18.089 20.964 19.7367 19.5057 21.8011 18.5398C23.8655 17.5739 26.1572 17.0909 28.6761 17.0909C30.4564 17.0909 32.0379 17.233 33.4205 17.517C34.803 17.8011 35.8258 17.0568 36.4886 18.2841L34.4432 26.2386C34.0076 26.1061 33.4583 25.9735 32.7955 25.8409C32.1326 25.6894 31.3939 25.6136 30.5795 25.6136C28.6667 25.6136 27.3125 26.0777 26.517 27.0057C25.7405 27.9148 25.3523 29.2216 25.3523 30.9261V78H15.0398ZM59.8338 78.8523C55.5724 78.8523 51.8793 77.9148 48.7543 76.0398C45.6293 74.1648 43.205 71.5417 41.4815 68.1705C39.777 64.7992 38.9247 60.8598 38.9247 56.3523C38.9247 51.8447 39.777 47.8958 41.4815 44.5057C43.205 41.1155 45.6293 38.483 48.7543 36.608C51.8793 34.733 55.5724 33.7955 59.8338 33.7955C64.0952 33.7955 67.7884 34.733 70.9134 36.608C74.0384 38.483 76.4531 41.1155 78.1577 44.5057C79.8812 47.8958 80.7429 51.8447 80.7429 56.3523C80.7429 60.8598 79.8812 64.7992 78.1577 68.1705C76.4531 71.5417 74.0384 74.1648 70.9134 76.0398C67.7884 77.9148 64.0952 78.8523 59.8338 78.8523ZM59.8906 70.6136C62.2012 70.6136 64.133 69.9792 65.6861 68.7102C67.2391 67.4223 68.3944 65.6989 69.152 63.5398C69.9285 61.3807 70.3168 58.9754 70.3168 56.3239C70.3168 53.6534 69.9285 51.2386 69.152 49.0795C68.3944 46.9015 67.2391 45.1686 65.6861 43.8807C64.133 42.5928 62.2012 41.9489 59.8906 41.9489C57.5232 41.9489 55.5535 42.5928 53.9815 43.8807C52.4285 45.1686 51.2637 46.9015 50.4872 49.0795C49.7296 51.2386 49.3509 53.6534 49.3509 56.3239C49.3509 58.9754 49.7296 61.3807 50.4872 63.5398C51.2637 65.6989 52.4285 67.4223 53.9815 68.7102C55.5535 69.9792 57.5232 70.6136 59.8906 70.6136ZM108.506 78.8523C104.244 78.8523 100.551 77.9148 97.4261 76.0398C94.3011 74.1648 91.8769 71.5417 90.1534 68.1705C88.4489 64.7992 87.5966 60.8598 87.5966 56.3523C87.5966 51.8447 88.4489 47.8958 90.1534 44.5057C91.8769 41.1155 94.3011 38.483 97.4261 36.608C100.551 34.733 104.244 33.7955 108.506 33.7955C112.767 33.7955 116.46 34.733 119.585 36.608C122.71 38.483 125.125 41.1155 126.83 44.5057C128.553 47.8958 129.415 51.8447 129.415 56.3523C129.415 60.8598 128.553 64.7992 126.83 68.1705C125.125 71.5417 122.71 74.1648 119.585 76.0398C116.46 77.9148 112.767 78.8523 108.506 78.8523ZM108.562 70.6136C110.873 70.6136 112.805 69.9792 114.358 68.7102C115.911 67.4223 117.066 65.6989 117.824 63.5398C118.6 61.3807 118.989 58.9754 118.989 56.3239C118.989 53.6534 118.6 51.2386 117.824 49.0795C117.066 46.9015 115.911 45.1686 114.358 43.8807C112.805 42.5928 110.873 41.9489 108.562 41.9489C106.195 41.9489 104.225 42.5928 102.653 43.8807C101.1 45.1686 99.9356 46.9015 99.1591 49.0795C98.4015 51.2386 98.0227 53.6534 98.0227 56.3239C98.0227 58.9754 98.4015 61.3807 99.1591 63.5398C99.9356 65.6989 101.1 67.4223 102.653 68.7102C104.225 69.9792 106.195 70.6136 108.562 70.6136ZM154.337 78.767C150.909 78.767 147.84 77.8864 145.132 76.125C142.424 74.3636 140.284 71.8068 138.712 68.4545C137.14 65.1023 136.354 61.0303 136.354 56.2386C136.354 51.3902 137.149 47.2992 138.74 43.9659C140.35 40.6136 142.518 38.0852 145.246 36.3807C147.973 34.6572 151.013 33.7955 154.365 33.7955C156.922 33.7955 159.024 34.2311 160.672 35.1023C162.32 35.9545 163.626 36.9867 164.592 38.1989C165.558 39.392 166.306 40.5189 166.837 41.5795H167.263V19.8182H177.575V78H167.462V71.125H166.837C166.306 72.1856 165.539 73.3125 164.536 74.5057C163.532 75.6799 162.206 76.6837 160.558 77.517C158.911 78.3504 156.837 78.767 154.337 78.767ZM157.206 70.3295C159.384 70.3295 161.24 69.7424 162.774 68.5682C164.308 67.375 165.473 65.7178 166.268 63.5966C167.064 61.4754 167.462 59.0038 167.462 56.1818C167.462 53.3598 167.064 50.9072 166.268 48.8239C165.492 46.7405 164.337 45.1212 162.803 43.9659C161.287 42.8106 159.422 42.233 157.206 42.233C154.914 42.233 153.001 42.8295 151.467 44.0227C149.933 45.2159 148.778 46.8636 148.001 48.9659C147.225 51.0682 146.837 53.4735 146.837 56.1818C146.837 58.9091 147.225 61.3428 148.001 63.483C148.797 65.6042 149.962 67.2803 151.496 68.5114C153.049 69.7235 154.952 70.3295 157.206 70.3295Z"
              fill="black"
            />
            <path
              d="M32.0008 152C35.4751 134.223 40.4799 125.257 55.5008 113L75.0008 119C70.8 120.784 68.8852 122.182 67.5008 126.5C65.5275 135.154 65.9043 140.414 65.5008 149.5C62.4448 160.539 59.8696 166.815 44.5008 168C35.7515 168.322 31.9354 166.648 32.0008 152Z"
              fill="#73D83B"
            />
            <path
              d="M1.09676 122.5C0.172726 118.374 6.09658 110 9.09676 110C12.0969 110 19.5967 129.5 20.0968 130.5C20.5968 131.5 3.57828 129.237 1.09676 122.5Z"
              fill="#73D83B"
              stroke="#73D83B"
            />
          </svg>
        </div>

        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Sign up
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {error && (
            <div className="mb-4 text-sm font-medium text-red-600">{error}</div>
          )}

          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={onSubmit}
          >
            {({ isSubmitting, errors, touched }) => (
              <Form className="space-y-6">
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Email
                  </label>
                  <div className="mt-1">
                    <Field
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                    />
                    {errors.email && touched.email && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.email}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="phoneNumber"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Phone Number
                  </label>
                  <div className="mt-1">
                    <Field
                      id="phoneNumber"
                      name="phoneNumber"
                      type="tel"
                      autoComplete="tel"
                      required
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                    />
                    {errors.phoneNumber && touched.phoneNumber && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.phoneNumber}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Password
                  </label>
                  <div className="mt-1">
                    <Field
                      id="password"
                      name="password"
                      type="password"
                      autoComplete="new-password"
                      required
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                    />
                    {errors.password && touched.password && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.password}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Confirm Password
                  </label>
                  <div className="mt-1">
                    <Field
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      autoComplete="new-password"
                      required
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                    />
                    {errors.confirmPassword && touched.confirmPassword && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.confirmPassword}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    {isSubmitting ? "Signing up..." : "Sign up"}
                  </button>
                </div>
              </Form>
            )}
          </Formik>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  Or continue with
                </span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-3">
              <div>
                <a
                  href="#"
                  className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                >
                  <span className="sr-only">Sign up with Google</span>
                  <svg
                    className="w-5 h-5"
                    aria-hidden="true"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{" "}
              <button
                onClick={() => navigate("/login")}
                className="font-medium text-green-600 hover:text-green-500"
              >
                Sign in
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupForm;
