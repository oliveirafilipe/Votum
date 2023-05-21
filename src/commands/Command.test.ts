import { CommandoClient, CommandoMessage } from "discord.js-commando"
import { Guild, GuildMember, Permissions, User, SnowflakeUtil, Message } from "discord.js"
import { CouncilData } from "../CouncilData"
import Command from './Command'

const mockVotumInitialize = jest.fn()
const mockVotumGetCouncil = jest
  .fn()
  .mockReturnValue({
    active: true,
    councilorRole: 'councilorRole',
    initialize: () => mockVotumInitialize(),
    getConfig: (config: any) => config
  })

jest.mock("../Votum", () => ({ getCouncil: () => mockVotumGetCouncil() }))

describe("Command tests", () => {
  let userId: string, 
    user: User,
    commandClient: CommandoClient,
    mockCommandoInfo: any,
    command: Command,
    guild: Guild,
    member: GuildMember,
    commandMessage: CommandoMessage

  beforeEach(() => {
    userId = SnowflakeUtil.generate()
    user = new User(new CommandoClient({ restSweepInterval: 0 }), {
      id: userId,
    })
    commandClient = new CommandoClient({ restSweepInterval: 0, owner: 'anotherOwner' })
    mockCommandoInfo = {
      description: "command",
      name: "test",
      councilOnly: false,
      adminOnly: true,
      adminsAlwaysAllowed: false,
    }
  })

  test("Should create Command instance", () => {
    const command = new Command(
      new CommandoClient({ restSweepInterval: 0 }),
      mockCommandoInfo
    )
    expect(command.description).toBe("command")
    expect(command.guildOnly).toBe(true)
    expect(command.memberName).toBe("test")
    expect(command.councilOnly).toBe(false)
    expect(command.adminOnly).toBe(true)
    expect(command.adminsAlwaysAllowed).toBe(false)
  })

  test("Should have permission if author user is owner", () => {
    mockCommandoInfo.adminOnly = false
    const command = new Command(
      new CommandoClient({ restSweepInterval: 0, owner: userId }),
      mockCommandoInfo
    )
    configureCommandMessage()

    const hasPermission = command.hasPermission(commandMessage)
    expect(hasPermission).toBe(true)
  })

  test("Should have permission if author has permission to manage guild and command is admin only", () => {
    configureCommandDependencies(
      [
        {
          id: 123,
          permissions: [Permissions.ALL]
        },
        {
          id: 'foo-role',
          permissions: []
        }
      ],
      ['foo-role']
    )

    const hasPermission = command.hasPermission(commandMessage)
    expect(hasPermission).toBe(true)
  })

  test("Should have permission if author has admin role and command is admin only", () => {
    configureCommandDependencies(
      [
        {
          id: 123,
          permissions: []
        },
        {
          id: 'foo-role',
          name: 'Votum Admin',
          permissions: []
        }
      ],
      ['foo-role']
    )

    const hasPermission = command.hasPermission(commandMessage)
    expect(hasPermission).toBe(true)
  })

  test("Should not have permission if author is not admin and command is admin only", () => {
    configureCommandDependencies(
      [
        {
          id: 123,
          permissions: []
        }
      ],
      []
    )

    const hasPermission = command.hasPermission(commandMessage)
    expect(hasPermission).toBe(false)
  })

  test("Should have permission if author is admin and admins are always allowed", () => {
    mockCommandoInfo.adminOnly = false
    mockCommandoInfo.adminsAlwaysAllowed = true
    configureCommandDependencies(
      [
        {
          id: 123,
          permissions: []
        },
        {
          id: 'foo-role',
          name: 'Votum Admin',
          permissions: []
        }
      ],
      ['foo-role']
    )

    const hasPermission = command.hasPermission(commandMessage)
    expect(hasPermission).toBe(true)
  })

  test("Should have permission if author has role that is allowed in council", () => {
    mockCommandoInfo = {
      ...mockCommandoInfo,
      adminOnly: false,
      allowWithConfigurableRoles: ['proposeRole'] as Array<keyof CouncilData>
    }
    configureCommandDependencies(
      [
        {
          id: 123,
          permissions: []
        },
        {
          id: 'proposeRole',
          permissions: [],
        }
      ],
      ['proposeRole']
    )

    const hasPermission = command.hasPermission(commandMessage)
    expect(hasPermission).toBe(true)
  })

  test("Should have permission if council and author have councilor role", () => {
    mockCommandoInfo.adminOnly = false
    configureCommandDependencies(
      [
        {
          id: 123,
          permissions: []
        },
        {
          id: 'councilorRole',
          permissions: [],
        }
      ],
      ['councilorRole']
    )

    const hasPermission = command.hasPermission(commandMessage)
    expect(hasPermission).toBe(true)
  })

  test("Should run command", async () => {
    configureCommandDependencies(
      [
        {
          id: 123,
          permissions: []
        }
      ],
      []
    )

    const replyMessage = await command.run(commandMessage, {})
    expect(replyMessage).toStrictEqual( { content: "This command has no implementation." })
  })

  function configureCommandDependencies(guildRoles: any, memberRoles: any) : void {
    let memberInfo = {
      user: { id: user.id, username: user.username },
      roles: memberRoles
    }
    command = new Command(
      commandClient,
      mockCommandoInfo
    )
    guild = new Guild(commandClient, {
      id: 123,
      roles: guildRoles,
      members: [
        memberInfo,
      ],
    })
    member = new GuildMember(
      commandClient,
      memberInfo,
      guild
    )
    configureCommandMessage()
  }

  function configureCommandMessage() : void {
    commandMessage = {
      channel: { id: 10 },
      reply: (msg: string) => { return { content: msg } as Message },
      author: user,
      member: member,
    } as unknown as CommandoMessage
  }
})