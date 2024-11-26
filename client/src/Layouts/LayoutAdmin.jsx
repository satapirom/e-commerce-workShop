import { Outlet } from "react-router-dom";
const LayoutAdmin = () => {
    return (
        <div>
            <h1>sidebar</h1>
            <h1>Header</h1>
            <hr />
            <Outlet />
        </div>
    )
}
export default LayoutAdmin