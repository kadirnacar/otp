import {
  Location,
  NavigateFunction,
  Params,
  useLocation,
  useNavigate,
  useParams,
} from 'react-router-dom';

export interface WithRouter {
  navigate?: NavigateFunction;
  location?: Location;
  params?: Readonly<Params<string>>;
}

export const withRouter = (Component: any) => {
  const Wrapper = (props) => {
    const navigate = useNavigate();
    const location = useLocation();
    const params = useParams();
    return <Component navigate={navigate} params={params} location={location} {...props} />;
  };

  return Wrapper;
};
