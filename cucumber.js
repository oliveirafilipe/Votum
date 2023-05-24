module.exports = {
  default: {
    requireModule: ["ts-node/register"],
    require: ["src/features/step_definitions/**/*.ts"],
    paths: ["src/features/"]
  },
}
