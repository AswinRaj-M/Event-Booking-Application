import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setGoogleAuthData } from "../../features/user.slice";
import Loader from "../../components/common/Loader";
import { COMMON_ROUTES, USER_ROUTES } from "../../constants/Routes";

const GoogleAuthSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    const userStr = searchParams.get("user");

    if (userStr) {
      try {
        const user = JSON.parse(decodeURIComponent(userStr));
        dispatch(setGoogleAuthData({ user }));
        navigate(USER_ROUTES.HOME, { replace: true });
      } catch (error) {
        console.error("Error parsing Google user data:", error);
        navigate(COMMON_ROUTES.LOGIN, { replace: true });
      }
    } else {
      navigate(COMMON_ROUTES.LOGIN, { replace: true });
    }
  }, [searchParams, dispatch, navigate]);

  return <Loader />;
};

export default GoogleAuthSuccess;
