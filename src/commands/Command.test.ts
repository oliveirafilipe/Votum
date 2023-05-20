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

    const hasPermission = command.hasPermission(buildCommandMessage(user, undefined))

    expect(hasPermission).toBe(true)
  })

  test("Should have permission if author has permission to manage guild and command is admin only", () => {
    const command = new Command(
      commandClient,
      mockCommandoInfo
    )
    const guild = buildGuild(
      commandClient,
      user,
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
    const member = new GuildMember(
      commandClient,
      {
        user: { id: user.id, username: user.username },
        roles: ['foo-role']
      },
      guild
    )

    const hasPermission = command.hasPermission(buildCommandMessage(user, member))
    expect(hasPermission).toBe(true)
  })

  test("Should have permission if author has admin role and command is admin only", () => {
    const command = new Command(
      commandClient,
      mockCommandoInfo
    )
    const guild = buildGuild(
      commandClient,
      user,
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
    const member = new GuildMember(
      commandClient,
      {
        user: { id: user.id, username: user.username },
        roles: ['foo-role']
      },
      guild
    )

    const hasPermission = command.hasPermission(buildCommandMessage(user, member))
    expect(hasPermission).toBe(true)
  })

  test("Should not have permission if author is not admin and command is admin only", () => {
    const command = new Command(
      commandClient,
      mockCommandoInfo
    )
    const guild = buildGuild(
      commandClient,
      user,
      [
        {
          id: 123,
          permissions: []
        }
      ],
      []
    )
    const member = new GuildMember(
      commandClient,
      {
        user: { id: user.id, username: user.username },
      },
      guild
    )

    const hasPermission = command.hasPermission(buildCommandMessage(user, member))
    expect(hasPermission).toBe(false)
  })

  test("Should have permission if author is admin and admins are always allowed", () => {
    mockCommandoInfo.adminOnly = false
    mockCommandoInfo.adminsAlwaysAllowed = true

    const command = new Command(
      commandClient,
      mockCommandoInfo
    )
    const guild = buildGuild(
      commandClient,
      user,
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
    const member = new GuildMember(
      commandClient,
      {
        user: { id: user.id, username: user.username },
        roles: ['foo-role']
      },
      guild
    )

    const hasPermission = command.hasPermission(buildCommandMessage(user, member))
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
    const guild = buildGuild(
      commandClient,
      user,
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
    const member = new GuildMember(
      commandClient,
      {
        user: { id: user.id, username: user.username },
        roles: ['proposeRole']
      },
      guild
    )

    const hasPermission = command.hasPermission(buildCommandMessage(user, member))
    expect(hasPermission).toBe(true)
  })

  test("Should have permission if council and author have councilor role", () => {
    mockCommandoInfo.adminOnly = false

    const command = new Command(
      commandClient,
      mockCommandoInfo
    )
    const guild = buildGuild(
      commandClient,
      user,
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
    const member = new GuildMember(
      commandClient,
      {
        user: { id: user.id, username: user.username },
        roles: ['councilorRole']
      },
      guild
    )

    const hasPermission = command.hasPermission(buildCommandMessage(user, member))
    expect(hasPermission).toBe(true)
  })

  test("Should run command", async () => {
    const command = new Command(
      commandClient,
      mockCommandoInfo
    )
    const guild = buildGuild(
      commandClient,
      user,
      [
        {
          id: 123,
          permissions: []
        }
      ],
      []
    )
    const member = new GuildMember(
      commandClient,
      {
        user: { id: user.id, username: user.username },
      },
      guild
    )

    const replyMessage = await command.run(buildCommandMessage(user, member), {})
    expect(replyMessage).toStrictEqual( { content: "This command has no implementation." })
  })
})

function buildGuild(commandClient: CommandoClient, user: User, guildRoles: any, memberRoles: any) : Guild {
  return new Guild(commandClient, {
    id: 123,
    roles: guildRoles,
    members: [
      {
        user: { id: user.id, username: user.username },
        roles: memberRoles
      },
    ],
  })
}

function buildCommandMessage(user: User, member: GuildMember|undefined) : CommandoMessage {
  return {
    channel: { id: 10 },
    reply: (msg: string) => { return { content: msg } as Message },
    author: user,
    member: member,
  } as unknown as CommandoMessage
}