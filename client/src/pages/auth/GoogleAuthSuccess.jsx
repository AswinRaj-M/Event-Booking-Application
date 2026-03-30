import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setGoogleAuthData } from "../../features/user.slice";
import Loader from "../../components/common/Loader";

const GoogleAuthSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    const accessToken = searchParams.get("accessToken");
    const userStr = searchParams.get("user");

    if (accessToken && userStr) {
      try {
        const user = JSON.parse(decodeURIComponent(userStr));
        dispatch(setGoogleAuthData({ accessToken, user }));
        navigate("/user/home", { replace: true });
      } catch (error) {
        console.error("Error parsing Google user data:", error);
        navigate("/login", { replace: true });
      }
    } else {
      navigate("/login", { replace: true });
    }
  }, [searchParams, dispatch, navigate]);

  return <Loader />;
};

export default GoogleAuthSuccess;
