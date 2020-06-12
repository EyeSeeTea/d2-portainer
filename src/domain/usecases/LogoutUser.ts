import { UserSession } from "./../entities/UserSession";
import { StringEither } from "../../utils/Either";
import { SessionRepository } from "../repositories/SessionRepository";

export class LogoutUser {
    constructor(private sessionRepository: SessionRepository) {}

    public async execute(): Promise<void> {
        this.sessionRepository.logout();
    }
}
