import Council from "../../Council"

// const assert = require("assert")
const { Given, When, Then } = require("@cucumber/cucumber")

Given("Council is not set", function () {
  // Write code here that turns the phrase above into concrete actions
  return this.council = null
})

Given("Council is set", function () {
  // Write code here that turns the phrase above into concrete actions
  this.council = Council
  return this.council = 3
})

When("I ask whether it's Friday yet", function () {
  // Write code here that turns the phrase above into concrete actions
  return "pending"
})

Then("I should be told {string}", function () {
  // Write code here that turns the phrase above into concrete actions
  return "pending"
})
