import IGroup from "../interfaces/IGroup";
import { GroupModel } from "../models/group.model";

class GroupRepository {
    public async getAllGroups(): Promise<IGroup[]> {
        return await GroupModel.find();
    }

    public async getGroupByName(name: string): Promise<IGroup | null> {
        return await GroupModel.findOne({ name });
    }

    public async createGroup(name: string): Promise<IGroup> {
        return await GroupModel.create({ name });
    }
}

export const groupRepository = new GroupRepository();
