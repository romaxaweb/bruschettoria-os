import type { BruschettoriaState } from "@/types/os"

export function getIngredientNetAmount(
  ingredient: BruschettoriaState["ingredients"][number]
) {
  const grossAmount =
    (ingredient.packageUnits ?? 1) * ingredient.packageAmount

  const netAmount =
    grossAmount * (1 - ingredient.wastePercent / 100)

  return Math.max(0, netAmount)
}

export function getIngredientUnitCost(
  ingredient: BruschettoriaState["ingredients"][number]
) {
  const netAmount = getIngredientNetAmount(ingredient)

  if (netAmount <= 0) return 0

  return ingredient.packagePrice / netAmount
}

export function getMenuItemDirectCost(
  state: BruschettoriaState,
  menuItem: BruschettoriaState["menu"][number]
) {
  const recipeCost = menuItem.recipe.reduce((sum, line) => {
    const ingredient = state.ingredients.find(
      (item) => item.id === line.ingredientId
    )

    if (!ingredient) return sum

    return (
      sum +
      getIngredientUnitCost(ingredient) * line.amount
    )
  }, 0)

  return recipeCost + (menuItem.extraCost ?? 0)
}

export function calculateFinancials(state: BruschettoriaState) {
  const budgetTotal = state.budget.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice,
    0
  )

  const paidBudget = state.budget
    .filter((item) => item.status === "paid")
    .reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)

  const dailySales = state.menu.reduce(
    (sum, item) => sum + item.dailySales,
    0
  )

  const monthlyRevenue = state.menu.reduce(
    (sum, item) =>
      sum +
      item.sellingPrice *
        item.dailySales *
        state.settings.workingDays,
    0
  )

  const monthlyDirectCosts = state.menu.reduce(
    (sum, item) =>
      sum +
      getMenuItemDirectCost(state, item) *
        item.dailySales *
        state.settings.workingDays,
    0
  )

  const fixedCosts =
    state.settings.rent +
    state.settings.utilities +
    state.settings.marketing +
    state.settings.otherFixedCosts

  const revenueFees =
    monthlyRevenue *
    ((state.settings.acquiringPercent +
      state.settings.taxPercent) /
      100)

  const monthlyProfit =
    monthlyRevenue -
    monthlyDirectCosts -
    fixedCosts -
    revenueFees

  const averageSellingPrice =
    dailySales > 0
      ? monthlyRevenue /
        (dailySales * state.settings.workingDays)
      : 0

  const averageDirectCost =
    dailySales > 0
      ? monthlyDirectCosts /
        (dailySales * state.settings.workingDays)
      : 0

  const averageFoodCost =
    averageSellingPrice > 0
      ? (averageDirectCost / averageSellingPrice) * 100
      : 0

  const contributionPerItem =
    (averageSellingPrice - averageDirectCost) *
    (1 -
      (state.settings.acquiringPercent +
        state.settings.taxPercent) /
        100)

  const breakEvenPerDay =
    contributionPerItem > 0
      ? Math.ceil(
          fixedCosts /
            contributionPerItem /
            state.settings.workingDays
        )
      : 0

  const paybackMonths =
    monthlyProfit > 0
      ? state.settings.borrowedAmount / monthlyProfit
      : null

  const fundingGap =
    state.settings.borrowedAmount - budgetTotal

  return {
    budgetTotal,
    paidBudget,
    dailySales,
    monthlyRevenue,
    monthlyDirectCosts,
    fixedCosts,
    revenueFees,
    monthlyProfit,
    averageSellingPrice,
    averageDirectCost,
    averageFoodCost,
    breakEvenPerDay,
    paybackMonths,
    fundingGap,
  }
}
