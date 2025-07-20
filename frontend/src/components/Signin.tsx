import { Auth } from "../components/Auth";

export const Signin = () => {
  return (
    <div>
      <div className="">
        <div>
          <Auth type="signin" />
        </div>
        <div className="hidden lg:block"></div>
      </div>
    </div>
  );
};
