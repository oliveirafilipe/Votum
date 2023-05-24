import { CommandoClient, CommandoMessage } from "discord.js-commando"
import PingInactiveCommand from "./PingInactiveCommand"
import { Collection, Guild, GuildMember, Message, SnowflakeUtil, User } from "discord.js"

const mockVotumInitialize = jest.fn()
jest.mock("../../Motion", () => ({}))
jest.mock('../../Util', () => ({
  MAX_MESSAGE_SIZE: 70
}))
const mockCouncil = {
  active: true,
  councilorRole: "councilorRole",
  initialize: () => mockVotumInitialize(),
  getConfig: (config: any) => config,
  currentMotion: null,
}
const mockCommandMessage = {
  channel: { id: 10 },
  reply: jest.fn((msg: string) => {
    return { content: msg } as Message
  }),
  say: jest.fn((msg: string) => {
    return { content: msg } as Message
  }),
}
const mockGetCommandMessage = jest.fn().mockReturnValue(mockCommandMessage)
const mockGetCouncil = jest.fn().mockReturnValue(mockCouncil)
jest.mock("../../Votum", () => ({
  getCouncil: () => mockGetCouncil(),
}))

describe("PingInactiveCommand tests", () => {
  let commandClient: CommandoClient,
    pingInactiveCommand: PingInactiveCommand,
    user: User,
    guild: Guild,
    member: GuildMember,
    commandMessage: CommandoMessage

  beforeEach(() => {
    jest.clearAllMocks()
    commandClient = new CommandoClient({ restSweepInterval: 0 })
    pingInactiveCommand = new PingInactiveCommand(commandClient)
    user = new User(commandClient, {
      id: SnowflakeUtil.generate(),
    })
    guild = new Guild(commandClient, {
      id: SnowflakeUtil.generate()
    })
    member = new GuildMember(
      commandClient,
      {
        user: { id: user.id, username: user.username },
      },
      guild
    )
    commandMessage = mockGetCommandMessage()
  })

  test("Should create PingInactiveCommand instance", () => {
    expect(pingInactiveCommand.name).toBe("pinginactive")
    expect(pingInactiveCommand.aliases).toContain("pingremaining")
    expect(pingInactiveCommand.aliases).toContain("mentionremaining")
    expect(pingInactiveCommand.aliases).toContain("alertothers")
    expect(pingInactiveCommand.aliases).toContain("lazyvoters")
    expect(pingInactiveCommand.description).toBe(
      "Mention the remaining councilmembers who haven't voted yet."
    )
    expect(pingInactiveCommand.adminsAlwaysAllowed).toBe(true)
  })

  test("Should not execute if there is no motion active", async () => {
    mockGetCouncil.mockReturnValue({...mockCouncil})
    const commandResult = await pingInactiveCommand.run(commandMessage, {})
    expect(commandResult).toStrictEqual({
      content: "There is no motion active.",
    })
  })

  test("Should send only one reply if smaller than max message size", async () => {
    const remainingVotersList = new Collection<string, GuildMember>()
    remainingVotersList.set('voter1', member);
    mockGetCouncil.mockReturnValue({
      ...mockCouncil,
      currentMotion: { getRemainingVoters: () => remainingVotersList},
    })

    const commandResult = await pingInactiveCommand.run(commandMessage, {})

    expect(commandResult).toStrictEqual({
      content: `These councilors still need to vote:\n\n${member}`,
    })
    expect(commandMessage.say).toHaveBeenCalledTimes(0);
    expect(commandMessage.reply).toHaveBeenCalledTimes(1);
  })

  test("Should divide text in multiple replies if bigger than max message size", async () => {
    const remainingVotersList = new Collection<string, GuildMember>()
    remainingVotersList.set('voter1', member)
    remainingVotersList.set('voter2', member);
    remainingVotersList.set('voter3', member);
    remainingVotersList.set('voter4', member);
    remainingVotersList.set('voter5', member);
    mockGetCouncil.mockReturnValue({
      ...mockCouncil,
      currentMotion: { getRemainingVoters: () => remainingVotersList},
    })

    const commandResult = await pingInactiveCommand.run(commandMessage, {})

    expect(commandResult).toStrictEqual({
      content: `${member}`,
    }) 
    expect(commandMessage.say).toHaveBeenCalledTimes(2);
    expect(commandMessage.reply).toHaveBeenCalledTimes(1);
  })
})
