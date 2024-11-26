import { Outlet } from "react-router-dom";

const Layout = () => {
    return (
        <div>
            <h1>Layouts</h1>
            <hr />
            <Outlet />
        </div>
    )
}
export default Layout;