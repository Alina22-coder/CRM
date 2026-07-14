import StatusCodes from "../enums/status-codes.enum";
import ApiError from "../errors/api.error";
import { groupRepository } from "../repositories/group.repository";

class GroupService {
    public async getAllGroups() {
        return await groupRepository.getAllGroups();
    }

    public async createGroup(name: string) {
        await this.isNameGroupUnique(name);

        try {
            return await groupRepository.createGroup(name);
        } catch (e) {
            if ((e as { code?: number }).code === 11000) {
                throw new ApiError(
                    "Group with this name already exists",
                    StatusCodes.BAD_REQUEST,
                );
            }
            throw e;
        }
    }

    public async isNameGroupUnique(name: string) {
        const group = await groupRepository.getGroupByName(name);

        if (group) {
            throw new ApiError("Group with this name already exists", StatusCodes.BAD_REQUEST);
        }
    }
}

export const groupService = new GroupService();
