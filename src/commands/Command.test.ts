import { CommandoClient, CommandoMessage } from "discord.js-commando"
import Command from './Command'
//@ts-ignore
import Votum from "../Votum"
import { Guild, GuildMember, Permissions, User, SnowflakeUtil, Message } from "discord.js"
import { CouncilData } from "../CouncilData"

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
  let userId: string, user: User, commandClient: CommandoClient, mockCommandoInfo: any
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

    const hasPermission = command.hasPermission(
      {
        channel: { id: 10 },
        reply: (msg: string) => {},
        author: user
      } as unknown as CommandoMessage
    )

    expect(hasPermission).toBe(true)
  })

  test("Should have permission if author has permission to manage guild and command is admin only", () => {
    const command = new Command(
      commandClient,
      mockCommandoInfo
    )
    const guild = new Guild(commandClient, {
      id: 123,
      roles: [
        {
          id: 123,
          permissions: [Permissions.ALL]
        },
        {
          id: 'foo-role',
          permissions: []
        }
      ],
      members: [
        {
          user: { id: user.id, username: user.username },
          roles: ['foo-role']
        },
      ],
    })
    const member = new GuildMember(
      commandClient,
      {
        user: { id: user.id, username: user.username },
        roles: ['foo-role']
      },
      guild
    )

    const hasPermission = command.hasPermission(
      {
        channel: { id: 10 },
        reply: (msg: string) => {},
        author: user,
        member: member,
      } as unknown as CommandoMessage
    )

    expect(hasPermission).toBe(true)
  })

  test("Should have permission if author has admin role and command is admin only", () => {
    const command = new Command(
      commandClient,
      mockCommandoInfo
    )
    const guild = new Guild(commandClient, {
      id: 123,
      roles: [
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
      members: [
        {
          user: { id: user.id, username: user.username },
          roles: ['foo-role']
        },
      ],
    })
    const member = new GuildMember(
      commandClient,
      {
        user: { id: user.id, username: user.username },
        roles: ['foo-role']
      },
      guild
    )

    const hasPermission = command.hasPermission(
      {
        channel: { id: 10 },
        reply: (msg: string) => {},
        author: user,
        member: member,
      } as unknown as CommandoMessage
    )

    expect(hasPermission).toBe(true)
  })

  test("Should not have permission if author is not admin and command is admin only", () => {
    const command = new Command(
      commandClient,
      mockCommandoInfo
    )
    const guild = new Guild(commandClient, {
      id: 123,
      roles: [
        {
          id: 123,
          permissions: [],
        }
      ],
      members: [
        {
          user: { id: user.id, username: user.username },
        },
      ],
    })
    const member = new GuildMember(
      commandClient,
      {
        user: { id: user.id, username: user.username },
      },
      guild
    )

    const hasPermission = command.hasPermission(
      {
        channel: { id: 10 },
        reply: (msg: string) => {},
        author: user,
        member: member,
      } as unknown as CommandoMessage
    )

    expect(hasPermission).toBe(false)
  })

  test("Should have permission if author is admin and admins are always allowed", () => {
    mockCommandoInfo.adminOnly = false
    mockCommandoInfo.adminsAlwaysAllowed = true

    const command = new Command(
      commandClient,
      mockCommandoInfo
    )
    const guild = new Guild(commandClient, {
      id: 123,
      roles: [
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
      members: [
        {
          user: { id: user.id, username: user.username },
          roles: ['foo-role']
        },
      ],
    })
    const member = new GuildMember(
      commandClient,
      {
        user: { id: user.id, username: user.username },
        roles: ['foo-role']
      },
      guild
    )

    const hasPermission = command.hasPermission(
      {
        channel: { id: 10 },
        reply: (msg: string) => {},
        author: user,
        member: member,
      } as unknown as CommandoMessage
    )

    expect(hasPermission).toBe(true)
  })

  test("Should have permission if author has role that is allowed in council", () => {
    mockCommandoInfo = {
      ...mockCommandoInfo,
      adminOnly: false,
      allowWithConfigurableRoles: ['proposeRole'] as Array<keyof CouncilData>
    }

    const command = new Command(
      commandClient,
      mockCommandoInfo
    )
    const guild = new Guild(commandClient, {
      id: 123,
      roles: [
        {
          id: 123,
          permissions: [],
        },
        {
          id: 'proposeRole',
          permissions: [],
        }
      ],
      members: [
        {
          user: { id: user.id, username: user.username },
          roles: ['proposeRole']
        },
      ],
    })
    const member = new GuildMember(
      commandClient,
      {
        user: { id: user.id, username: user.username },
        roles: ['proposeRole']
      },
      guild
    )

    const hasPermission = command.hasPermission(
      {
        channel: { id: 10 },
        reply: (msg: string) => {},
        author: user,
        member: member,
      } as unknown as CommandoMessage
    )

    expect(hasPermission).toBe(true)
  })

  test("Should have permission if council and author have councilor role", () => {
    mockCommandoInfo.adminOnly = false

    const command = new Command(
      commandClient,
      mockCommandoInfo
    )
    const guild = new Guild(commandClient, {
      id: 123,
      roles: [
        {
          id: 123,
          permissions: [],
        },
        {
          id: 'councilorRole',
          permissions: [],
        }
      ],
      members: [
        {
          user: { id: user.id, username: user.username },
          roles: ['councilorRole']
        },
      ],
    })
    const member = new GuildMember(
      commandClient,
      {
        user: { id: user.id, username: user.username },
        roles: ['councilorRole']
      },
      guild
    )

    const hasPermission = command.hasPermission(
      {
        channel: { id: 10 },
        reply: (msg: string) => {},
        author: user,
        member: member,
      } as unknown as CommandoMessage
    )

    expect(hasPermission).toBe(true)
  })

  test("Should run command", async () => {
    const command = new Command(
      commandClient,
      mockCommandoInfo
    )
    const guild = new Guild(commandClient, {
      id: 123,
      roles: [
        {
          id: 123,
          permissions: [],
        }
      ],
      members: [
        {
          user: { id: user.id, username: user.username },
        },
      ],
    })
    const member = new GuildMember(
      commandClient,
      {
        user: { id: user.id, username: user.username },
      },
      guild
    )
    const commandMessage = {
      channel: { id: 10 },
      reply: (msg: string) => { return { content: msg } as Message },
      author: user,
      member: member,
    } as unknown as CommandoMessage

    const replyMessage = await command.run(commandMessage, {})

    expect(replyMessage).toStrictEqual( { content: "This command has no implementation." })
  })
})