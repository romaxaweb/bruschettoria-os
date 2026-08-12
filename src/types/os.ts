export type BusinessSettings = {
  rent: number
  workingDays: number
  utilities: number
  marketing: number
  otherFixedCosts: number
  acquiringPercent: number
  taxPercent: number
  borrowedAmount: number
}

export type BudgetItem = {
  id: string
  name: string
  category: string
  description?: string
  imageUrl?: string
  linkUrl?: string
  quantity: number
  unitPrice: number
  status: "planned" | "quoted" | "ordered" | "paid"
}

export type RecipeLine = {
  id: string
  ingredientId: string
  amount: number
  costOverride?: number
}

export type MenuItemType = "food" | "drink"

export type DrinkKind =
  | "lemonade"
  | "red-wine"
  | "white-wine"
  | "sparkling-wine"
  | "aperol"
  | "beer"
  | "cola"

export type MenuItem = {
  id: string
  name: string
  imageUrl?: string
  accent?: string
  menuType?: MenuItemType
  drinkKind?: DrinkKind
  sellingPrice: number
  dailySales: number
  recipe: RecipeLine[]
  extraCost: number
}

export type LaunchItemKind =
  | "group"
  | "task"
  | "expense"

export type LaunchTask = {
  id: string
  title: string
  description: string
  category?: string
  dueDate?: string
  completed: boolean

  // Optional for backward compatibility with old launchPlan data
  kind?: LaunchItemKind
  parentId?: string
  budgetItemId?: string
}

export type Supplier = {
  id: string
  name: string
  contactPerson?: string
  phone?: string
  linkUrl?: string
  note?: string
}

export type IngredientCategory =
  | "bread"
  | "vegetable"
  | "fruit"
  | "meat"
  | "fish"
  | "dairy"
  | "sauce"
  | "oil"
  | "packaging"
  | "beverage"
  | "alcohol"
  | "other"

export type Ingredient = {
  id: string
  name: string
  category: IngredientCategory
  supplierId: string
  imageUrl?: string
  baseUnit: "g" | "ml" | "pcs"
  packageUnits: number
  packageAmount: number
  packagePrice: number
  wastePercent: number
  note?: string
}

export type BruschettoriaState = {
  settings: BusinessSettings
  budget: BudgetItem[]
  suppliers: Supplier[]
  ingredients: Ingredient[]
  menu: MenuItem[]
  launchPlan: LaunchTask[]
}
