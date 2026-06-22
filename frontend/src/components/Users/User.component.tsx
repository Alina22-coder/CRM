import type { FC } from "react";
import type { IUser } from "../../interfaces/IUser";

type UserPropType = {
    user: IUser;
};

export const User: FC<UserPropType> = ({ user }) => {
    return (
        <>
            <div>
                {user.name} - {user.surname}
            </div>
        </>
    );
};
