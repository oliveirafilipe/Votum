Feature: Motion
  Motion should correctly behave

  Scenario: Create Motion with no Council
    Given Council is not set
    When I ask to create a Motion
    Then I should be told "Nope"