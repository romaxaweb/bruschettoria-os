"use client"

import { useEffect, useMemo, useState } from "react"
import {
  AirVent,
  Beef,
  ArrowRight,
  Apple,
  Boxes,
  BottleWine,
  Building2,
  Calculator,
  CalendarDays,
  CheckCircle2,
  ChartNoAxesCombined,
  ChevronRight,
  Circle,
  CircleDollarSign,
  ClipboardCheck,
  CookingPot,
  Coins,
  Droplets,
  Flame,
  Fish,
  ExternalLink,
  ImagePlus,
  LayoutDashboard,
  Lightbulb,
  Link2,
  ListChecks,
  Milk,
  Package,
  PackageSearch,
  PlugZap,
  Percent,
  Plus,
  Refrigerator,
  ReceiptText,
  RotateCcw,
  Salad,
  Save,
  X,
  Settings,
  ShieldCheck,
  ShoppingBasket,
  Sparkles,
  Soup,
  Store,
  Trash2,
  Utensils,
  WalletCards,
  Wheat,
  LayoutGrid,
  Sandwich,
  Wine,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { defaultState } from "@/lib/data/defaults"
import {
  calculateFinancials,
  getMenuItemDirectCost,
} from "@/lib/calculations/finance"
import type {
  BruschettoriaState,
  BudgetItem,
  IngredientCategory,
  MenuItem,

  DrinkKind,
  MenuItemType,} from "@/types/os"

const STORAGE_KEY = "bruschettoria-os-v1"

type Section =
  | "dashboard"
  | "launch"
  | "budget"
  | "suppliers"
  | "ingredients"
  | "menu"
  | "settings"

const navigation = [
  { id: "dashboard" as const, label: "Dashboard", icon: LayoutDashboard },
  {
    id: "launch" as const,
    label: "План запуску",
    icon: ListChecks,
  },
  { id: "budget" as const, label: "Бюджет запуску", icon: WalletCards },
  {
    id: "suppliers" as const,
    label: "Постачальники",
    icon: Store,
  },
  {
    id: "ingredients" as const,
    label: "Інгредієнти",
    icon: ShoppingBasket,
  },
  { id: "menu" as const, label: "Меню та маржа", icon: CookingPot },
  { id: "settings" as const, label: "Параметри", icon: Settings },
]

const budgetCategories = {
  Локація: {
    icon: Building2,
    badge: "border-sky-400/20 bg-sky-400/10 text-sky-300",
    iconBox: "bg-sky-400/10 text-sky-300",
  },
  Фасад: {
    icon: Store,
    badge: "border-orange-400/20 bg-orange-400/10 text-orange-300",
    iconBox: "bg-orange-400/10 text-orange-300",
  },
  Клімат: {
    icon: AirVent,
    badge: "border-cyan-400/20 bg-cyan-400/10 text-cyan-300",
    iconBox: "bg-cyan-400/10 text-cyan-300",
  },
  Холод: {
    icon: Refrigerator,
    badge: "border-blue-400/20 bg-blue-400/10 text-blue-300",
    iconBox: "bg-blue-400/10 text-blue-300",
  },
  Випічка: {
    icon: Flame,
    badge: "border-amber-400/20 bg-amber-400/10 text-amber-300",
    iconBox: "bg-amber-400/10 text-amber-300",
  },
  Кухня: {
    icon: Utensils,
    badge: "border-rose-400/20 bg-rose-400/10 text-rose-300",
    iconBox: "bg-rose-400/10 text-rose-300",
  },
  Вода: {
    icon: Droplets,
    badge: "border-teal-400/20 bg-teal-400/10 text-teal-300",
    iconBox: "bg-teal-400/10 text-teal-300",
  },
  Інженерія: {
    icon: PlugZap,
    badge: "border-violet-400/20 bg-violet-400/10 text-violet-300",
    iconBox: "bg-violet-400/10 text-violet-300",
  },
  Пакування: {
    icon: Package,
    badge: "border-fuchsia-400/20 bg-fuchsia-400/10 text-fuchsia-300",
    iconBox: "bg-fuchsia-400/10 text-fuchsia-300",
  },
  Продукти: {
    icon: ShoppingBasket,
    badge: "border-emerald-400/20 bg-emerald-400/10 text-emerald-300",
    iconBox: "bg-emerald-400/10 text-emerald-300",
  },
  Бренд: {
    icon: Sparkles,
    badge: "border-pink-400/20 bg-pink-400/10 text-pink-300",
    iconBox: "bg-pink-400/10 text-pink-300",
  },
  Резерв: {
    icon: ShieldCheck,
    badge: "border-yellow-400/20 bg-yellow-400/10 text-yellow-300",
    iconBox: "bg-yellow-400/10 text-yellow-300",
  },
  Інше: {
    icon: Boxes,
    badge: "border-white/15 bg-white/5 text-white/65",
    iconBox: "bg-white/5 text-white/60",
  },
} as const

type BudgetCategory = keyof typeof budgetCategories

const budgetCategoryNames = Object.keys(
  budgetCategories
) as BudgetCategory[]

const budgetStatusMeta = {
  planned: {
    label: "План",
    className:
      "border-white/10 bg-white/5 text-white/60",
  },
  quoted: {
    label: "Є кошторис",
    className:
      "border-sky-400/20 bg-sky-400/10 text-sky-300",
  },
  ordered: {
    label: "Замовлено",
    className:
      "border-orange-400/20 bg-orange-400/10 text-orange-300",
  },
  paid: {
    label: "Оплачено",
    className:
      "border-emerald-400/20 bg-emerald-400/10 text-emerald-300",
  },
} as const

const ingredientUnitLabels = {
  g: "г",
  ml: "мл",
  pcs: "шт",
} as const

const menuAccentMeta = {
  tomato: {
    label: "Tomato",
    border: "border-red-400/20",
    background:
      "bg-gradient-to-br from-red-400/[0.09] to-[#1c1512]",
    icon: "border-red-400/20 bg-red-400/10 text-red-300",
    badge: "bg-red-400/10 text-red-300",
    line: "bg-red-400",
  },
  pear: {
    label: "Pear",
    border: "border-lime-300/20",
    background:
      "bg-gradient-to-br from-lime-300/[0.07] to-[#1c1512]",
    icon: "border-lime-300/20 bg-lime-300/10 text-lime-200",
    badge: "bg-lime-300/10 text-lime-200",
    line: "bg-lime-300",
  },
  ocean: {
    label: "Ocean",
    border: "border-sky-400/20",
    background:
      "bg-gradient-to-br from-sky-400/[0.08] to-[#1c1512]",
    icon: "border-sky-400/20 bg-sky-400/10 text-sky-300",
    badge: "bg-sky-400/10 text-sky-300",
    line: "bg-sky-400",
  },
  mango: {
    label: "Mango",
    border: "border-amber-400/20",
    background:
      "bg-gradient-to-br from-amber-400/[0.09] to-[#1c1512]",
    icon: "border-amber-400/20 bg-amber-400/10 text-amber-300",
    badge: "bg-amber-400/10 text-amber-300",
    line: "bg-amber-400",
  },
  burgundy: {
    label: "Burgundy",
    border: "border-rose-400/20",
    background:
      "bg-gradient-to-br from-rose-950/35 to-[#1c1512]",
    icon: "border-rose-400/20 bg-rose-400/10 text-rose-300",
    badge: "bg-rose-400/10 text-rose-300",
    line: "bg-rose-400",
  },
  watermelon: {
    label: "Watermelon",
    border: "border-pink-400/20",
    background:
      "bg-gradient-to-br from-pink-400/[0.08] to-[#1c1512]",
    icon: "border-pink-400/20 bg-pink-400/10 text-pink-300",
    badge: "bg-pink-400/10 text-pink-300",
    line: "bg-pink-400",
  },
} as const

type MenuAccent = keyof typeof menuAccentMeta

const menuAccentNames = Object.keys(
  menuAccentMeta
) as MenuAccent[]

const drinkKindMeta = {
  lemonade: {
    label: "Лимонад",
    icon: Droplets,
    accent: "mango" as MenuAccent,
  },
  "red-wine": {
    label: "Вино червоне",
    icon: BottleWine,
    accent: "burgundy" as MenuAccent,
  },
  "white-wine": {
    label: "Вино біле",
    icon: BottleWine,
    accent: "pear" as MenuAccent,
  },
  "sparkling-wine": {
    label: "Вино ігристе",
    icon: Sparkles,
    accent: "pear" as MenuAccent,
  },
  aperol: {
    label: "Aperol",
    icon: Flame,
    accent: "mango" as MenuAccent,
  },
  beer: {
    label: "Пиво",
    icon: Wheat,
    accent: "pear" as MenuAccent,
  },
  cola: {
    label: "Cola",
    icon: Droplets,
    accent: "burgundy" as MenuAccent,
  },
} as const

const drinkKindNames = Object.keys(
  drinkKindMeta
) as DrinkKind[]

const getMenuItemIcon = (
  item: BruschettoriaState["menu"][number],
  state: BruschettoriaState
) => {
  if (
    item.menuType === "drink" &&
    item.drinkKind &&
    drinkKindMeta[item.drinkKind]
  ) {
    return drinkKindMeta[item.drinkKind].icon
  }

  const name = item.name.toLowerCase()

  if (
    name.includes("туне") ||
    name.includes("кревет") ||
    name.includes("риба") ||
    name.includes("лосос")
  ) {
    return Fish
  }

  if (
    name.includes("прошу") ||
    name.includes("ялович") ||
    name.includes("хамон") ||
    name.includes("ндую") ||
    name.includes("м’яс")
  ) {
    return Beef
  }

  if (
    name.includes("груш") ||
    name.includes("манго") ||
    name.includes("кавун") ||
    name.includes("дин")
  ) {
    return Apple
  }

  if (
    name.includes("томат") ||
    name.includes("овоч") ||
    name.includes("рукол") ||
    name.includes("авокад")
  ) {
    return Salad
  }

  if (
    name.includes("бурат") ||
    name.includes("горгон") ||
    name.includes("сир") ||
    name.includes("фета") ||
    name.includes("страчател")
  ) {
    return Milk
  }

  const recipeCategories = item.recipe
    .map((line) =>
      state.ingredients.find(
        (ingredient) => ingredient.id === line.ingredientId
      )
    )
    .filter(Boolean)
    .map((ingredient) => ingredient?.category)

  if (recipeCategories.includes("fish")) return Fish
  if (recipeCategories.includes("meat")) return Beef
  if (recipeCategories.includes("vegetable")) return Salad
  if (recipeCategories.includes("fruit")) return Apple
  if (recipeCategories.includes("dairy")) return Milk
  if (recipeCategories.includes("bread")) return Wheat

  return CookingPot
}

const ingredientCategoryMeta = {
  bread: {
    label: "Хліб",
    icon: Wheat,
    iconBox:
      "border-amber-400/20 bg-amber-400/10 text-amber-300",
    badge:
      "border-amber-400/15 bg-amber-400/[0.08] text-amber-200",
    row: "hover:bg-amber-400/[0.035]",
    accent: "bg-amber-400",
  },
  vegetable: {
    label: "Овочі",
    icon: Salad,
    iconBox:
      "border-emerald-400/20 bg-emerald-400/10 text-emerald-300",
    badge:
      "border-emerald-400/15 bg-emerald-400/[0.08] text-emerald-200",
    row: "hover:bg-emerald-400/[0.035]",
    accent: "bg-emerald-400",
  },
  fruit: {
    label: "Фрукти",
    icon: Apple,
    iconBox:
      "border-yellow-400/20 bg-yellow-400/10 text-yellow-300",
    badge:
      "border-yellow-400/15 bg-yellow-400/[0.08] text-yellow-200",
    row: "hover:bg-yellow-400/[0.035]",
    accent: "bg-yellow-400",
  },
  meat: {
    label: "М’ясо",
    icon: Beef,
    iconBox:
      "border-red-400/20 bg-red-400/10 text-red-300",
    badge:
      "border-red-400/15 bg-red-400/[0.08] text-red-200",
    row: "hover:bg-red-400/[0.035]",
    accent: "bg-red-400",
  },
  fish: {
    label: "Риба та морепродукти",
    icon: Fish,
    iconBox:
      "border-sky-400/20 bg-sky-400/10 text-sky-300",
    badge:
      "border-sky-400/15 bg-sky-400/[0.08] text-sky-200",
    row: "hover:bg-sky-400/[0.035]",
    accent: "bg-sky-400",
  },
  dairy: {
    label: "Молочне та сири",
    icon: Milk,
    iconBox:
      "border-orange-200/20 bg-orange-100/10 text-orange-100",
    badge:
      "border-orange-200/15 bg-orange-100/[0.07] text-orange-100",
    row: "hover:bg-orange-100/[0.03]",
    accent: "bg-orange-200",
  },
  sauce: {
    label: "Соуси",
    icon: Soup,
    iconBox:
      "border-violet-400/20 bg-violet-400/10 text-violet-300",
    badge:
      "border-violet-400/15 bg-violet-400/[0.08] text-violet-200",
    row: "hover:bg-violet-400/[0.035]",
    accent: "bg-violet-400",
  },
  oil: {
    label: "Олія",
    icon: BottleWine,
    iconBox:
      "border-orange-400/20 bg-orange-400/10 text-orange-300",
    badge:
      "border-orange-400/15 bg-orange-400/[0.08] text-orange-200",
    row: "hover:bg-orange-400/[0.035]",
    accent: "bg-orange-400",
  },
  packaging: {
    label: "Пакування",
    icon: Package,
    iconBox:
      "border-slate-400/20 bg-slate-400/10 text-slate-300",
    badge:
      "border-slate-400/15 bg-slate-400/[0.08] text-slate-200",
    row: "hover:bg-slate-400/[0.035]",
    accent: "bg-slate-400",
  },
  beverage: {
    label: "Напої",
    icon: Droplets,
    iconBox:
      "border-cyan-400/20 bg-cyan-400/10 text-cyan-300",
    badge:
      "border-cyan-400/15 bg-cyan-400/[0.08] text-cyan-200",
    row: "hover:bg-cyan-400/[0.035]",
    accent: "bg-cyan-400",
  },
  alcohol: {
    label: "Алкоголь",
    icon: BottleWine,
    iconBox:
      "border-rose-400/20 bg-rose-400/10 text-rose-300",
    badge:
      "border-rose-400/15 bg-rose-400/[0.08] text-rose-200",
    row: "hover:bg-rose-400/[0.035]",
    accent: "bg-rose-400",
  },
  other: {
    label: "Інше",
    icon: Boxes,
    iconBox:
      "border-white/15 bg-white/5 text-white/55",
    badge:
      "border-white/10 bg-white/5 text-white/50",
    row: "hover:bg-white/[0.025]",
    accent: "bg-white/40",
  },
} as const

const ingredientCategoryNames = Object.keys(
  ingredientCategoryMeta
) as IngredientCategory[]

const inferIngredientCategory = (
  name: string
): IngredientCategory => {
  const normalized = name.toLowerCase()

  if (
    normalized.includes("чіабат") ||
    normalized.includes("хліб") ||
    normalized.includes("фокач")
  ) {
    return "bread"
  }

  if (
    normalized.includes("томат") ||
    normalized.includes("рукол") ||
    normalized.includes("цибул") ||
    normalized.includes("авокад") ||
    normalized.includes("зелень")
  ) {
    return "vegetable"
  }

  if (
    normalized.includes("груш") ||
    normalized.includes("манго") ||
    normalized.includes("кавун") ||
    normalized.includes("дин")
  ) {
    return "fruit"
  }

  if (
    normalized.includes("прошу") ||
    normalized.includes("ялович") ||
    normalized.includes("хамон") ||
    normalized.includes("ндую")
  ) {
    return "meat"
  }

  if (
    normalized.includes("туне") ||
    normalized.includes("кревет") ||
    normalized.includes("лосос") ||
    normalized.includes("риба")
  ) {
    return "fish"
  }

  if (
    normalized.includes("бурат") ||
    normalized.includes("горгон") ||
    normalized.includes("фета") ||
    normalized.includes("страчател") ||
    normalized.includes("сир")
  ) {
    return "dairy"
  }

  if (
    normalized.includes("песто") ||
    normalized.includes("соус") ||
    normalized.includes("айолі") ||
    normalized.includes("мед")
  ) {
    return "sauce"
  }

  if (normalized.includes("олія")) {
    return "oil"
  }

  if (
    normalized.includes("пакув") ||
    normalized.includes("сервет") ||
    normalized.includes("короб")
  ) {
    return "packaging"
  }

  return "other"
}

const getIngredientNetAmount = (ingredient: {
  packageUnits?: number
  packageAmount: number
  wastePercent: number
}) => {
  const grossAmount =
    (ingredient.packageUnits ?? 1) * ingredient.packageAmount

  const net =
    grossAmount * (1 - ingredient.wastePercent / 100)

  return net > 0 ? net : 0
}

const getIngredientUnitCost = (ingredient: {
  packageAmount: number
  packagePrice: number
  wastePercent: number
}) => {
  const netAmount = getIngredientNetAmount(ingredient)

  if (netAmount <= 0) return 0

  return ingredient.packagePrice / netAmount
}

const formatMoneyDetailed = (value: number) =>
  new Intl.NumberFormat("uk-UA", {
    style: "currency",
    currency: "UAH",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)

const readImageFile = (
  file: File,
  onReady: (imageUrl: string) => void
) => {
  if (!file.type.startsWith("image/")) return

  const reader = new FileReader()

  reader.onload = () => {
    if (typeof reader.result !== "string") return

    const image = new Image()

    image.onload = () => {
      const maxDimension = 1200

      let width = image.naturalWidth
      let height = image.naturalHeight

      if (
        width > maxDimension ||
        height > maxDimension
      ) {
        const scale =
          maxDimension / Math.max(width, height)

        width = Math.round(width * scale)
        height = Math.round(height * scale)
      }

      const canvas = document.createElement("canvas")

      canvas.width = width
      canvas.height = height

      const context = canvas.getContext("2d")

      if (!context) {
        onReady(reader.result as string)
        return
      }

      context.imageSmoothingEnabled = true
      context.imageSmoothingQuality = "high"

      context.drawImage(
        image,
        0,
        0,
        width,
        height
      )

      const compressed = canvas.toDataURL(
        "image/webp",
        0.78
      )

      onReady(compressed)
    }

    image.onerror = () => {
      console.error(
        "Не вдалося обробити зображення"
      )
    }

    image.src = reader.result
  }

  reader.onerror = () => {
    console.error(
      "Не вдалося прочитати зображення"
    )
  }

  reader.readAsDataURL(file)
}


const formatMoney = (value: number) =>
  new Intl.NumberFormat("uk-UA", {
    style: "currency",
    currency: "UAH",
    maximumFractionDigits: 0,
  }).format(value)

const formatNumber = (value: number) =>
  new Intl.NumberFormat("uk-UA", {
    maximumFractionDigits: 1,
  }).format(value)

export function BruschettoriaDashboard() {
  const [section, setSection] = useState<Section>("dashboard")
  const [state, setState] = useState<BruschettoriaState>(defaultState)
  const [hydrated, setHydrated] = useState(false)
  const [expenseDialogOpen, setExpenseDialogOpen] = useState(false)
  const [launchTaskDialogOpen, setLaunchTaskDialogOpen] =
    useState(false)
  const [ingredientDialogOpen, setIngredientDialogOpen] =
    useState(false)
  const [menuItemDialogOpen, setMenuItemDialogOpen] =
    useState(false)
  const [menuFilter, setMenuFilter] = useState<
    "all" | "food" | "drink"
  >("all")
  const [selectedMenuItemId, setSelectedMenuItemId] =
    useState<string | null>(null)
  const [newMenuItem, setNewMenuItem] = useState({
    name: "",
    imageUrl: "",
    accent: "tomato" as MenuAccent,
    menuType: "food" as MenuItemType,
    drinkKind: "lemonade" as DrinkKind,
    sellingPrice: 199,
    dailySales: 5,
    extraCost: 0,
    recipe: [] as BruschettoriaState["menu"][number]["recipe"],
  })
  const [selectedIngredientId, setSelectedIngredientId] =
    useState<string | null>(null)
  const [newIngredient, setNewIngredient] = useState({
    name: "",
    category: "other" as IngredientCategory,
    supplierId: "",
    imageUrl: "",
    baseUnit: "g" as "g" | "ml" | "pcs",
    packageUnits: 1,
    packageAmount: 1000,
    packagePrice: 0,
    wastePercent: 0,
    note: "",
  })
  const [newLaunchTask, setNewLaunchTask] = useState({
    title: "",
    category: "Інше",
    description: "",
    dueDate: "",
  })
  const [selectedExpenseId, setSelectedExpenseId] = useState<string | null>(null)
  const [newExpense, setNewExpense] = useState({
    name: "",
    category: "Кухня" as BudgetCategory,
    description: "",
    imageUrl: "",
    linkUrl: "",
    quantity: 1,
    unitPrice: 0,
  })

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(
          stored
        ) as Partial<BruschettoriaState>

        setState({
          ...defaultState,
          ...parsed,
          settings: {
            ...defaultState.settings,
            ...(parsed.settings ?? {}),
          },
          budget: parsed.budget ?? defaultState.budget,
          suppliers:
            parsed.suppliers ?? defaultState.suppliers,
          ingredients: (() => {
            const savedIngredients =
              parsed.ingredients ?? []

            const defaultIngredients =
              defaultState.ingredients.map(
                (defaultIngredient) => {
                  const savedIngredient =
                    savedIngredients.find(
                      (item) =>
                        item.id === defaultIngredient.id
                    )

                  const ingredient =
                    savedIngredient
                      ? {
                          ...defaultIngredient,
                          ...savedIngredient,
                        }
                      : defaultIngredient

                  return {
                    ...ingredient,
                    category:
                      ingredient.category ??
                      inferIngredientCategory(
                        ingredient.name
                      ),
                    packageUnits:
                      ingredient.packageUnits ?? 1,
                    imageUrl:
                      ingredient.imageUrl ?? "",
                  }
                }
              )

            const customIngredients =
              savedIngredients
                .filter(
                  (savedIngredient) =>
                    !defaultState.ingredients.some(
                      (defaultIngredient) =>
                        defaultIngredient.id ===
                        savedIngredient.id
                    )
                )
                .map((ingredient) => ({
                  ...ingredient,
                  category:
                    ingredient.category ??
                    inferIngredientCategory(
                      ingredient.name
                    ),
                  packageUnits:
                    ingredient.packageUnits ?? 1,
                  imageUrl:
                    ingredient.imageUrl ?? "",
                }))

            return [
              ...defaultIngredients,
              ...customIngredients,
            ]
          })(),
          menu: (() => {
            const savedMenu = parsed.menu ?? []

            const defaultItems = defaultState.menu.map(
              (defaultMenuItem) => {
                const savedMenuItem = savedMenu.find(
                  (item) => item.id === defaultMenuItem.id
                )

                if (!savedMenuItem) {
                  return {
                    ...defaultMenuItem,
                    menuType:
                      defaultMenuItem.menuType ?? "food",
                  }
                }

                return {
                  ...defaultMenuItem,
                  ...savedMenuItem,
                  menuType:
                    savedMenuItem.menuType ??
                    defaultMenuItem.menuType ??
                    "food",
                  recipe:
                    savedMenuItem.recipe ??
                    defaultMenuItem.recipe,
                  extraCost:
                    savedMenuItem.extraCost ??
                    defaultMenuItem.extraCost,
                  imageUrl:
                    savedMenuItem.imageUrl ??
                    defaultMenuItem.imageUrl,
                  accent:
                    savedMenuItem.accent ??
                    defaultMenuItem.accent,
                }
              }
            )

            const customItems = savedMenu
              .filter(
                (savedItem) =>
                  !defaultState.menu.some(
                    (defaultItem) =>
                      defaultItem.id === savedItem.id
                  )
              )
              .map((savedItem) => ({
                ...savedItem,
                menuType:
                  savedItem.menuType ?? "food",
                recipe: savedItem.recipe ?? [],
                extraCost: savedItem.extraCost ?? 0,
              }))

            return [...defaultItems, ...customItems]
          })(),
          launchPlan: defaultState.launchPlan.map(
            (defaultTask) => {
              const savedTask = parsed.launchPlan?.find(
                (task) => task.id === defaultTask.id
              )

              return savedTask
                ? {
                    ...defaultTask,
                    completed: savedTask.completed,
                  }
                : defaultTask
            }
          ),
        })
      }
    } catch {
      setState(defaultState)
    } finally {
      setHydrated(true)
    }
  }, [])

  useEffect(() => {
    if (!hydrated) return
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  }, [state, hydrated])

  const financials = useMemo(
    () => calculateFinancials(state),
    [state]
  )
  const selectedExpense = state.budget.find(
    (item) => item.id === selectedExpenseId
  )

  const selectedIngredient = state.ingredients.find(
    (item) => item.id === selectedIngredientId
  )

  const selectedMenuItem = state.menu.find(
    (item) => item.id === selectedMenuItemId
  )

  const fundingPercent =
    financials.budgetTotal > 0
      ? Math.min(
          100,
          (state.settings.borrowedAmount /
            financials.budgetTotal) *
            100
        )
      : 0

  const completedLaunchTasks = state.launchPlan.filter(
    (task) => task.completed
  ).length

  const launchProgress =
    state.launchPlan.length > 0
      ? (completedLaunchTasks / state.launchPlan.length) * 100
      : 0

  const toggleLaunchTask = (id: string) => {
    setState((current) => ({
      ...current,
      launchPlan: current.launchPlan.map((task) =>
        task.id === id
          ? { ...task, completed: !task.completed }
          : task
      ),
    }))
  }

  const addLaunchTask = () => {
    if (!newLaunchTask.title.trim()) return

    setState((current) => ({
      ...current,
      launchPlan: [
        ...current.launchPlan,
        {
          id: crypto.randomUUID(),
          title: newLaunchTask.title.trim(),
          category:
            newLaunchTask.category.trim() || "Інше",
          description:
            newLaunchTask.description.trim(),
          dueDate: newLaunchTask.dueDate,
          completed: false,
        },
      ],
    }))

    setNewLaunchTask({
      title: "",
      category: "Інше",
      description: "",
      dueDate: "",
    })

    setLaunchTaskDialogOpen(false)
  }

  const deleteLaunchTask = (id: string) => {
    setState((current) => ({
      ...current,
      launchPlan: current.launchPlan.filter(
        (task) => task.id !== id
      ),
    }))
  }

  const addSupplier = () => {
    setState((current) => ({
      ...current,
      suppliers: [
        ...current.suppliers,
        {
          id: crypto.randomUUID(),
          name: "Новий постачальник",
          contactPerson: "",
          phone: "",
          linkUrl: "",
          note: "",
        },
      ],
    }))
  }

  const updateSupplier = (
    id: string,
    patch: Partial<BruschettoriaState["suppliers"][number]>
  ) => {
    setState((current) => ({
      ...current,
      suppliers: current.suppliers.map((item) =>
        item.id === id ? { ...item, ...patch } : item
      ),
    }))
  }

  const deleteSupplier = (id: string) => {
    setState((current) => ({
      ...current,
      suppliers: current.suppliers.filter(
        (item) => item.id !== id
      ),
      ingredients: current.ingredients.map((item) =>
        item.supplierId === id
          ? { ...item, supplierId: "" }
          : item
      ),
    }))
  }

  const addIngredient = () => {
    if (!newIngredient.name.trim()) return

    setState((current) => ({
      ...current,
      ingredients: [
        ...current.ingredients,
        {
          id: crypto.randomUUID(),
          name: newIngredient.name.trim(),
          category: newIngredient.category,
          supplierId:
            newIngredient.supplierId ||
            current.suppliers[0]?.id ||
            "",
          imageUrl: newIngredient.imageUrl,
          baseUnit: newIngredient.baseUnit,
          packageUnits: newIngredient.packageUnits,
          packageAmount: newIngredient.packageAmount,
          packagePrice: newIngredient.packagePrice,
          wastePercent: newIngredient.wastePercent,
          note: newIngredient.note.trim(),
        },
      ],
    }))

    setNewIngredient({
      name: "",
      category: "other",
      supplierId: "",
      imageUrl: "",
      baseUnit: "g",
      packageUnits: 1,
      packageAmount: 1000,
      packagePrice: 0,
      wastePercent: 0,
      note: "",
    })

    setIngredientDialogOpen(false)
  }

  const updateIngredient = (
    id: string,
    patch: Partial<BruschettoriaState["ingredients"][number]>
  ) => {
    setState((current) => ({
      ...current,
      ingredients: current.ingredients.map((item) =>
        item.id === id ? { ...item, ...patch } : item
      ),
    }))
  }

  const deleteIngredient = (id: string) => {
    setState((current) => ({
      ...current,
      ingredients: current.ingredients.filter(
        (item) => item.id !== id
      ),
    }))
  }

  const updateSetting = (
    key: keyof BruschettoriaState["settings"],
    value: number
  ) => {
    setState((current) => ({
      ...current,
      settings: {
        ...current.settings,
        [key]: value,
      },
    }))
  }

  const updateBudgetItem = (
    id: string,
    patch: Partial<BudgetItem>
  ) => {
    setState((current) => ({
      ...current,
      budget: current.budget.map((item) =>
        item.id === id ? { ...item, ...patch } : item
      ),
    }))
  }

  const updateMenuItem = (
    id: string,
    patch: Partial<MenuItem>
  ) => {
    setState((current) => ({
      ...current,
      menu: current.menu.map((item) =>
        item.id === id ? { ...item, ...patch } : item
      ),
    }))
  }

  const addBudgetItem = () => {
    if (!newExpense.name.trim()) return

    setState((current) => ({
      ...current,
      budget: [
        ...current.budget,
        {
          id: crypto.randomUUID(),
          name: newExpense.name.trim(),
          category: newExpense.category,
          description: newExpense.description.trim(),
          imageUrl: newExpense.imageUrl,
          linkUrl: newExpense.linkUrl.trim(),
          quantity: newExpense.quantity,
          unitPrice: newExpense.unitPrice,
          status: "planned",
        },
      ],
    }))

    setNewExpense({
      name: "",
      category: "Кухня",
      description: "",
      imageUrl: "",
      linkUrl: "",
      quantity: 1,
      unitPrice: 0,
    })

    setExpenseDialogOpen(false)
  }

  const addMenuItem = () => {
    if (!newMenuItem.name.trim()) return

    setState((current) => ({
      ...current,
      menu: [
        ...current.menu,
        {
          id: crypto.randomUUID(),
          name: newMenuItem.name.trim(),
          imageUrl: newMenuItem.imageUrl,
          accent:
            newMenuItem.menuType === "drink"
              ? drinkKindMeta[newMenuItem.drinkKind].accent
              : newMenuItem.accent,
          menuType: newMenuItem.menuType,
          drinkKind:
            newMenuItem.menuType === "drink"
              ? newMenuItem.drinkKind
              : undefined,
          sellingPrice: newMenuItem.sellingPrice,
          dailySales: newMenuItem.dailySales,
          extraCost: newMenuItem.extraCost,
          recipe: newMenuItem.recipe,
        },
      ],
    }))

    setNewMenuItem({
      name: "",
      imageUrl: "",
      accent: "tomato",
      menuType: "food",
      drinkKind: "lemonade",
      sellingPrice: 199,
      dailySales: 5,
      extraCost: 0,
      recipe: [],
    })

    setMenuItemDialogOpen(false)
  }

  const addRecipeLine = (menuItemId: string) => {
    const firstIngredient = state.ingredients[0]

    if (!firstIngredient) return

    updateMenuItem(menuItemId, {
      recipe: [
        ...(state.menu.find((item) => item.id === menuItemId)
          ?.recipe ?? []),
        {
          id: crypto.randomUUID(),
          ingredientId: firstIngredient.id,
          amount: 0,
        },
      ],
    })
  }

  const updateRecipeLine = (
    menuItemId: string,
    lineId: string,
    patch: Partial<
      BruschettoriaState["menu"][number]["recipe"][number]
    >
  ) => {
    const menuItem = state.menu.find(
      (item) => item.id === menuItemId
    )

    if (!menuItem) return

    updateMenuItem(menuItemId, {
      recipe: menuItem.recipe.map((line) =>
        line.id === lineId
          ? { ...line, ...patch }
          : line
      ),
    })
  }

  const deleteRecipeLine = (
    menuItemId: string,
    lineId: string
  ) => {
    const menuItem = state.menu.find(
      (item) => item.id === menuItemId
    )

    if (!menuItem) return

    updateMenuItem(menuItemId, {
      recipe: menuItem.recipe.filter(
        (line) => line.id !== lineId
      ),
    })
  }

  const addNewMenuRecipeLine = () => {
    const firstIngredient = state.ingredients[0]

    if (!firstIngredient) return

    setNewMenuItem((current) => ({
      ...current,
      recipe: [
        ...current.recipe,
        {
          id: crypto.randomUUID(),
          ingredientId: firstIngredient.id,
          amount: 0,
        },
      ],
    }))
  }

  const resetState = () => {
    setState(defaultState)
    window.localStorage.removeItem(STORAGE_KEY)
  }

  return (
    <div className="min-h-screen bg-[#120d0a] text-[#fffaf5]">
      <div className="flex min-h-screen">
        <aside className="fixed inset-y-0 left-0 z-40 hidden w-[250px] border-r border-white/10 bg-[#17100d] p-4 lg:flex lg:flex-col">
          <div className="mb-8 flex items-center gap-3 px-2 pt-2">
            <div className="flex size-10 items-center justify-center rounded-2xl bg-[#ff9858] text-[#1a0e08]">
              <Store className="size-5" />
            </div>

            <div>
              <div className="font-medium">Bruschettoria</div>
              <div className="text-xs text-white/45">Operating System</div>
            </div>
          </div>

          <nav className="space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon
              const active = section === item.id

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSection(item.id)}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition ${
                    active
                      ? "bg-[#ff9858] text-[#1a0e08]"
                      : "text-white/60 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <Icon className="size-4" />
                  <span>{item.label}</span>
                </button>
              )
            })}
          </nav>

          <div className="mt-auto rounded-2xl border border-white/10 bg-white/[0.035] p-4">
            <div className="mb-2 text-xs text-white/45">
              Головна ціль
            </div>
            <div className="text-sm">
              Запустити прибутковий кіоск і повернути позичені кошти.
            </div>
          </div>
        </aside>

        <main className="min-w-0 flex-1 lg:ml-[250px]">
          <header className="border-b border-white/10 px-5 py-4 md:px-8">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-xs uppercase tracking-[0.18em] text-[#ffae78]">
                  Перша точка
                </div>
                <h1 className="mt-1 text-xl font-medium md:text-2xl">
                  {navigation.find((item) => item.id === section)?.label}
                </h1>
              </div>

              <div className="flex items-center gap-3">
                <div className="hidden rounded-full border border-white/10 px-3 py-1.5 text-xs text-white/50 sm:block">
                  Зміни зберігаються автоматично
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={resetState}
                  className="border-white/10 bg-white/5 text-white hover:bg-white/10 hover:text-white"
                >
                  <RotateCcw className="size-4" />
                  Скинути
                </Button>
              </div>
            </div>

            <div className="mt-4 flex gap-2 overflow-x-auto lg:hidden">
              {navigation.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSection(item.id)}
                  className={`whitespace-nowrap rounded-xl px-3 py-2 text-sm ${
                    section === item.id
                      ? "bg-[#ff9858] text-[#1a0e08]"
                      : "bg-white/5 text-white/60"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </header>

          <div className="p-5 md:p-8">
            {section === "dashboard" && (
              <div className="space-y-6">
                <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
                  <MetricCard
                    label="Бюджет запуску"
                    value={formatMoney(financials.budgetTotal)}
                    detail="Повний поточний кошторис"
                    icon={CircleDollarSign}
                    tone="orange"
                  />

                  <MetricCard
                    label="Виручка / місяць"
                    value={formatMoney(financials.monthlyRevenue)}
                    detail={`${financials.dailySales} продажів на день`}
                    icon={Calculator}
                    tone="amber"
                  />

                  <MetricCard
                    label="Прибуток / місяць"
                    value={formatMoney(financials.monthlyProfit)}
                    detail="Після продуктів і постійних витрат"
                    icon={WalletCards}
                    warning={financials.monthlyProfit <= 0}
                    tone="emerald"
                  />

                  <MetricCard
                    label="Окупність позики"
                    value={
                      financials.paybackMonths
                        ? `${formatNumber(financials.paybackMonths)} міс.`
                        : "Не окупається"
                    }
                    detail={`Позика: ${formatMoney(
                      state.settings.borrowedAmount
                    )}`}
                    icon={ClipboardCheck}
                    warning={!financials.paybackMonths}
                    tone="sky"
                  />
                </div>

                <div className="grid gap-5 xl:grid-cols-[1.25fr_0.75fr]">
                  <Card className="border-white/10 bg-[#1c1512] text-white">
                    <div className="p-5 md:p-6">
                      <div className="mb-6 flex items-start justify-between gap-4">
                        <div>
                          <div className="text-sm text-white/45">
                            Фінансування запуску
                          </div>
                          <div className="mt-1 text-lg font-medium">
                            Позичені кошти проти бюджету
                          </div>
                        </div>

                        <span className="rounded-full bg-[#ff9858]/15 px-3 py-1 text-xs text-[#ffae78]">
                          {formatNumber(fundingPercent)}%
                        </span>
                      </div>

                      <Progress
                        value={fundingPercent}
                        className="h-3 bg-white/10 [&>div]:bg-[#ff9858]"
                      />

                      <div className="mt-5 grid gap-3 sm:grid-cols-3">
                        <MiniStat
                          label="Доступно"
                          value={formatMoney(
                            state.settings.borrowedAmount
                          )}
                        />
                        <MiniStat
                          label="Необхідно"
                          value={formatMoney(financials.budgetTotal)}
                        />
                        <MiniStat
                          label={
                            financials.fundingGap >= 0
                              ? "Залишок"
                              : "Бракує"
                          }
                          value={formatMoney(
                            Math.abs(financials.fundingGap)
                          )}
                          accent
                        />
                      </div>
                    </div>
                  </Card>

                  <Card className="border-white/10 bg-[#1c1512] text-white">
                    <div className="p-5 md:p-6">
                      <div className="mb-5 text-sm text-white/45">
                        Економіка однієї точки
                      </div>

                      <div className="space-y-4">
                        <DataRow
                          label="Середній чек"
                          value={formatMoney(
                            financials.averageSellingPrice
                          )}
                        />
                        <DataRow
                          label="Середня собівартість"
                          value={formatMoney(
                            financials.averageDirectCost
                          )}
                        />
                        <DataRow
                          label="Середній Food Cost"
                          value={`${formatNumber(
                            financials.averageFoodCost
                          )}%`}
                        />
                        <DataRow
                          label="Точка беззбитковості"
                          value={`${financials.breakEvenPerDay} шт./день`}
                          accent
                        />
                      </div>
                    </div>
                  </Card>
                </div>

                <Card className="border-white/10 bg-[#1c1512] text-white">
                  <div className="p-5 md:p-6">
                    <div className="mb-5 flex items-center justify-between">
                      <div>
                        <div className="text-sm text-white/45">
                          Найбільші витрати запуску
                        </div>
                        <div className="mt-1 text-lg font-medium">
                          Що найбільше впливає на бюджет
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setSection("budget")}
                        className="flex items-center gap-1 text-sm text-[#ffae78]"
                      >
                        Відкрити бюджет
                        <ChevronRight className="size-4" />
                      </button>
                    </div>

                    <div className="space-y-3">
                      {[...state.budget]
                        .sort(
                          (a, b) =>
                            b.quantity * b.unitPrice -
                            a.quantity * a.unitPrice
                        )
                        .slice(0, 6)
                        .map((item) => {
                          const total =
                            item.quantity * item.unitPrice
                          const percent =
                            financials.budgetTotal > 0
                              ? (total /
                                  financials.budgetTotal) *
                                100
                              : 0

                          return (
                            <div
                              key={item.id}
                              className="grid gap-2 rounded-xl border border-white/8 bg-white/[0.025] p-3 sm:grid-cols-[1fr_auto]"
                            >
                              <div>
                                <div className="text-sm">
                                  {item.name}
                                </div>
                                <div className="mt-1 h-2 overflow-hidden rounded-full bg-white/8">
                                  <div
                                    className="h-full rounded-full bg-[#ff9858]"
                                    style={{
                                      width: `${Math.max(
                                        2,
                                        percent
                                      )}%`,
                                    }}
                                  />
                                </div>
                              </div>

                              <div className="text-sm font-medium">
                                {formatMoney(total)}
                              </div>
                            </div>
                          )
                        })}
                    </div>
                  </div>
                </Card>
              </div>
            )}
            {section === "launch" && (
              <div className="mx-auto max-w-5xl space-y-6">
                <Card className="overflow-hidden border-white/10 bg-[#1c1512] text-white">
                  <div className="p-5 md:p-7">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <div className="text-sm text-white/45">
                          Підготовка Bruschettoria
                        </div>

                        <h2 className="mt-1 text-xl font-medium">
                          План запуску
                        </h2>

                        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/45">
                          Усі організаційні, технічні та
                          документальні задачі до відкриття.
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="rounded-2xl border border-[#ff9858]/20 bg-[#ff9858]/10 px-4 py-3 text-right">
                          <div className="text-2xl font-medium text-[#ffae78]">
                            {Math.round(launchProgress)}%
                          </div>

                          <div className="text-xs text-white/40">
                            готовності
                          </div>
                        </div>

                        <Button
                          onClick={() =>
                            setLaunchTaskDialogOpen(true)
                          }
                          variant="outline"
                          className="h-11 rounded-xl border-[#ff9858]/25 bg-[#ff9858]/10 px-4 text-[#ffae78] hover:border-[#ff9858]/40 hover:bg-[#ff9858]/15 hover:text-[#ffc49d]"
                        >
                          <span className="flex size-6 items-center justify-center rounded-lg bg-[#ff9858] text-[#1a0e08]">
                            <Plus className="size-3.5" />
                          </span>

                          Додати етап
                        </Button>
                      </div>
                    </div>

                    <div className="mt-6">
                      <Progress
                        value={launchProgress}
                        className="h-3 bg-white/10 [&>div]:bg-[#ff9858]"
                      />

                      <div className="mt-2 flex items-center justify-between text-xs text-white/35">
                        <span>
                          Виконано {completedLaunchTasks} із{" "}
                          {state.launchPlan.length}
                        </span>

                        <span>
                          Залишилось{" "}
                          {state.launchPlan.length -
                            completedLaunchTasks}
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>

                {state.launchPlan.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-white/15 bg-white/[0.025] px-6 py-14 text-center">
                    <ListChecks className="mx-auto size-8 text-white/25" />

                    <div className="mt-4 font-medium">
                      План запуску порожній
                    </div>

                    <p className="mx-auto mt-2 max-w-md text-sm text-white/40">
                      Додай перший етап, який потрібно
                      завершити до відкриття.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {state.launchPlan.map((task, index) => (
                      <div
                        key={task.id}
                        className={`group flex items-start gap-4 rounded-2xl border p-5 transition md:p-6 ${
                          task.completed
                            ? "border-emerald-400/20 bg-emerald-400/[0.06]"
                            : "border-white/10 bg-[#1c1512] hover:border-[#ff9858]/25 hover:bg-[#211713]"
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() =>
                            toggleLaunchTask(task.id)
                          }
                          className={`flex size-11 shrink-0 items-center justify-center rounded-2xl border transition ${
                            task.completed
                              ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-300"
                              : "border-white/10 bg-white/5 text-white/45 hover:border-[#ff9858]/30 hover:bg-[#ff9858]/10 hover:text-[#ffae78]"
                          }`}
                          aria-label={
                            task.completed
                              ? "Позначити як невиконане"
                              : "Позначити як виконане"
                          }
                        >
                          {task.completed ? (
                            <CheckCircle2 className="size-5" />
                          ) : (
                            <Circle className="size-5" />
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            toggleLaunchTask(task.id)
                          }
                          className="min-w-0 flex-1 text-left"
                        >
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-xs font-medium text-white/25">
                              {String(index + 1).padStart(
                                2,
                                "0"
                              )}
                            </span>

                            {task.category && (
                              <span className="rounded-full border border-[#ff9858]/15 bg-[#ff9858]/8 px-2.5 py-1 text-xs text-[#ffae78]">
                                {task.category}
                              </span>
                            )}

                            {task.dueDate && (
                              <span className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-white/40">
                                <CalendarDays className="size-3" />
                                {new Intl.DateTimeFormat(
                                  "uk-UA",
                                  {
                                    day: "2-digit",
                                    month: "short",
                                    year: "numeric",
                                  }
                                ).format(
                                  new Date(
                                    `${task.dueDate}T00:00:00`
                                  )
                                )}
                              </span>
                            )}
                          </div>

                          <h3
                            className={`mt-3 font-medium ${
                              task.completed
                                ? "text-emerald-200 line-through decoration-emerald-400/40"
                                : "text-white"
                            }`}
                          >
                            {task.title}
                          </h3>

                          {task.description && (
                            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-white/45">
                              {task.description}
                            </p>
                          )}
                        </button>

                        <div className="flex shrink-0 items-center gap-2">
                          <span
                            className={`hidden rounded-full border px-3 py-1 text-xs sm:block ${
                              task.completed
                                ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-300"
                                : "border-white/10 bg-white/5 text-white/40"
                            }`}
                          >
                            {task.completed
                              ? "Виконано"
                              : "У плані"}
                          </span>

                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              deleteLaunchTask(task.id)
                            }
                            className="text-white/25 opacity-0 transition hover:bg-red-500/10 hover:text-red-300 group-hover:opacity-100"
                            aria-label="Видалити етап"
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <Dialog
                  open={launchTaskDialogOpen}
                  onOpenChange={setLaunchTaskDialogOpen}
                >
                  <DialogContent className="border-white/10 bg-[#1c1512] text-white sm:max-w-[560px]">
                    <DialogHeader>
                      <DialogTitle>
                        Додати етап запуску
                      </DialogTitle>

                      <DialogDescription className="text-white/45">
                        Додай будь-яку задачу, яку потрібно
                        завершити до відкриття.
                      </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-5 py-2">
                      <label className="block">
                        <span className="text-sm text-white/60">
                          Назва етапу
                        </span>

                        <Input
                          autoFocus
                          value={newLaunchTask.title}
                          placeholder="Наприклад: отримання позики"
                          onChange={(event) =>
                            setNewLaunchTask(
                              (current) => ({
                                ...current,
                                title: event.target.value,
                              })
                            )
                          }
                          className="mt-2 border-white/10 bg-white/5 text-white"
                        />
                      </label>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <label className="block">
                          <span className="text-sm text-white/60">
                            Категорія
                          </span>

                          <Input
                            value={newLaunchTask.category}
                            placeholder="Фінанси, вода, документи…"
                            onChange={(event) =>
                              setNewLaunchTask(
                                (current) => ({
                                  ...current,
                                  category:
                                    event.target.value,
                                })
                              )
                            }
                            className="mt-2 border-white/10 bg-white/5 text-white"
                          />
                        </label>

                        <label className="block">
                          <span className="text-sm text-white/60">
                            Дедлайн
                          </span>

                          <div className="mt-2 flex w-full min-w-0 rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                            <input
                              type="date"
                              value={newLaunchTask.dueDate}
                              onChange={(event) =>
                                setNewLaunchTask(
                                  (current) => ({
                                    ...current,
                                    dueDate:
                                      event.target.value,
                                  })
                                )
                              }
                              className="block w-full min-w-0 border-0 bg-transparent p-0 text-base text-white outline-none [color-scheme:dark]"
                            />
                          </div>
                        </label>
                      </div>

                      <label className="block">
                        <span className="text-sm text-white/60">
                          Опис або примітка
                        </span>

                        <textarea
                          value={
                            newLaunchTask.description
                          }
                          placeholder="Що саме потрібно зробити, з ким зв’язатись або які документи підготувати"
                          onChange={(event) =>
                            setNewLaunchTask(
                              (current) => ({
                                ...current,
                                description:
                                  event.target.value,
                              })
                            )
                          }
                          className="mt-2 min-h-28 w-full resize-none rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none placeholder:text-white/25"
                        />
                      </label>
                    </div>

                    <DialogFooter className="mt-2 rounded-b-2xl border-t border-white/10 bg-[#17100d] px-4 py-4">
                      <Button
                        variant="outline"
                        onClick={() =>
                          setLaunchTaskDialogOpen(false)
                        }
                        className="border-white/10 bg-white/5 text-white hover:bg-white/10 hover:text-white"
                      >
                        Скасувати
                      </Button>

                      <Button
                        onClick={addLaunchTask}
                        disabled={
                          !newLaunchTask.title.trim()
                        }
                        className="bg-[#ff9858] font-medium text-[#1a0e08] hover:bg-[#ffad78]"
                      >
                        <Plus className="size-4" />
                        Додати етап
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                <div className="flex items-start gap-3 rounded-2xl border border-sky-400/15 bg-sky-400/[0.05] p-4">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-sky-400/10 text-sky-300">
                    <ArrowRight className="size-4" />
                  </div>

                  <div>
                    <div className="text-sm font-medium text-sky-100/80">
                      Підказка
                    </div>

                    <p className="mt-1 text-sm leading-relaxed text-sky-100/50">
                      Після підписання договору оренди можна
                      паралельно запускати реєстрацію потужності,
                      HACCP, медичну книжку, проєктування води,
                      пошук обладнання та отримання фінансування.
                      Не обов’язково чекати завершення одного
                      процесу, щоб починати наступний.
                    </p>
                  </div>
                </div>
              </div>
            )}


            {section === "suppliers" && (
              <div className="space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="text-sm text-white/45">
                      База постачальників і контактів
                    </div>
                    <div className="mt-1 text-lg font-medium">
                      Де ти купуєш продукти, упаковку й обладнання
                    </div>
                  </div>

                  <Button
                    onClick={addSupplier}
                    className="bg-[#ff9858] text-[#1a0e08] hover:bg-[#ffad78]"
                  >
                    <Plus className="size-4" />
                    Додати постачальника
                  </Button>
                </div>

                <div className="rounded-2xl border border-sky-400/15 bg-sky-400/[0.05] p-4 text-sm leading-relaxed text-sky-100/60">
                  Це опорна база для майбутнього автоматичного
                  food cost. Далі інгредієнти будуть брати ціну саме
                  з цих закупівель.
                </div>

                <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#1c1512]">
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[1100px] text-left">
                      <thead className="border-b border-white/10 bg-white/[0.025] text-xs uppercase tracking-wide text-white/40">
                        <tr>
                          <th className="p-4 font-normal">Назва</th>
                          <th className="p-4 font-normal">Контакт</th>
                          <th className="p-4 font-normal">Телефон</th>
                          <th className="p-4 font-normal">Посилання</th>
                          <th className="p-4 font-normal">Примітка</th>
                          <th className="p-4" />
                        </tr>
                      </thead>

                      <tbody>
                        {state.suppliers.map((item) => (
                          <tr
                            key={item.id}
                            className="border-b border-white/8 last:border-0"
                          >
                            <td className="p-3">
                              <Input
                                value={item.name}
                                onChange={(event) =>
                                  updateSupplier(item.id, {
                                    name: event.target.value,
                                  })
                                }
                                className="min-w-[220px] border-white/10 bg-white/5 text-white"
                              />
                            </td>

                            <td className="p-3">
                              <Input
                                value={item.contactPerson ?? ""}
                                onChange={(event) =>
                                  updateSupplier(item.id, {
                                    contactPerson:
                                      event.target.value,
                                  })
                                }
                                className="min-w-[180px] border-white/10 bg-white/5 text-white"
                              />
                            </td>

                            <td className="p-3">
                              <Input
                                value={item.phone ?? ""}
                                onChange={(event) =>
                                  updateSupplier(item.id, {
                                    phone: event.target.value,
                                  })
                                }
                                className="min-w-[160px] border-white/10 bg-white/5 text-white"
                              />
                            </td>

                            <td className="p-3">
                              <Input
                                value={item.linkUrl ?? ""}
                                onChange={(event) =>
                                  updateSupplier(item.id, {
                                    linkUrl:
                                      event.target.value,
                                  })
                                }
                                placeholder="https://..."
                                className="min-w-[220px] border-white/10 bg-white/5 text-white"
                              />
                            </td>

                            <td className="p-3">
                              <Input
                                value={item.note ?? ""}
                                onChange={(event) =>
                                  updateSupplier(item.id, {
                                    note: event.target.value,
                                  })
                                }
                                className="min-w-[240px] border-white/10 bg-white/5 text-white"
                              />
                            </td>

                            <td className="p-3">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() =>
                                  deleteSupplier(item.id)
                                }
                                className="text-white/30 hover:bg-red-500/10 hover:text-red-300"
                              >
                                <Trash2 className="size-4" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
            {section === "ingredients" && (
              <div className="space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="text-sm text-white/45">
                      Закупівельні ціни та фасування
                    </div>

                    <div className="mt-1 text-lg font-medium">
                      База інгредієнтів
                    </div>
                  </div>

                  <Button
                    onClick={() => setIngredientDialogOpen(true)}
                    className="bg-[#ff9858] text-[#1a0e08] hover:bg-[#ffad78]"
                  >
                    <Plus className="size-4" />
                    Додати інгредієнт
                  </Button>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <Card className="overflow-hidden border-orange-400/20 bg-gradient-to-br from-[#2c1a13] to-[#1b120e] text-white">
                    <div className="relative p-5">
                      <div className="absolute -right-8 -top-8 size-24 rounded-full bg-orange-400/10 blur-2xl" />

                      <div className="text-sm text-orange-200/55">
                        Інгредієнтів у базі
                      </div>

                      <div className="mt-3 text-3xl font-medium text-orange-100">
                        {state.ingredients.length}
                      </div>
                    </div>
                  </Card>

                  <Card className="overflow-hidden border-sky-400/20 bg-gradient-to-br from-[#14212b] to-[#11181e] text-white">
                    <div className="relative p-5">
                      <div className="absolute -right-8 -top-8 size-24 rounded-full bg-sky-400/10 blur-2xl" />

                      <div className="text-sm text-sky-200/55">
                        Постачальників
                      </div>

                      <div className="mt-3 text-3xl font-medium text-sky-100">
                        {state.suppliers.length}
                      </div>
                    </div>
                  </Card>

                  <Card className="overflow-hidden border-emerald-400/20 bg-gradient-to-br from-[#14221c] to-[#101713] text-white">
                    <div className="relative p-5">
                      <div className="absolute -right-8 -top-8 size-24 rounded-full bg-emerald-400/10 blur-2xl" />

                      <div className="text-sm text-emerald-200/55">
                        Навіщо ця база
                      </div>

                      <div className="mt-3 text-sm leading-relaxed text-emerald-50/70">
                        Звідси рецепти отримуватимуть актуальну
                        ціну за грам, мілілітр або штуку.
                      </div>
                    </div>
                  </Card>
                </div>

                <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#1c1512]">
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[1180px] text-left">
                      <thead className="sticky top-0 z-20 border-b border-white/10 bg-[#241b17]/95 text-xs uppercase tracking-wide text-white/45 backdrop-blur-xl">
                        <tr>
                          <th className="p-4 font-normal">
                            Інгредієнт
                          </th>
                          <th className="p-4 font-normal">
                            Постачальник
                          </th>
                          <th className="p-4 font-normal">
                            Формат закупівлі
                          </th>
                          <th className="p-4 font-normal">
                            Ціна закупки
                          </th>
                          <th className="p-4 font-normal">
                            Втрати
                          </th>
                          <th className="p-4 font-normal">
                            Корисний вихід
                          </th>
                          <th className="p-4 font-normal">
                            Ціна за одиницю
                          </th>
                          <th className="p-4" />
                        </tr>
                      </thead>

                      <tbody>
                        {state.ingredients.map((item) => {
                          const categoryKey =
                            item.category ??
                            inferIngredientCategory(item.name)

                          const category =
                            ingredientCategoryMeta[categoryKey]

                          const CategoryIcon = category.icon

                          const supplier =
                            state.suppliers.find(
                              (currentSupplier) =>
                                currentSupplier.id ===
                                item.supplierId
                            )

                          const netAmount =
                            getIngredientNetAmount(item)

                          const unitCost =
                            getIngredientUnitCost(item)

                          return (
                            <tr
                              key={item.id}
                              className={`group relative border-b border-white/8 transition last:border-0 ${category.row}`}
                            >
                              <td className="relative p-3 pl-5">
                                <span
                                  className={`absolute inset-y-3 left-0 w-[3px] rounded-full ${category.accent}`}
                                />

                                <button
                                  type="button"
                                  onClick={() =>
                                    setSelectedIngredientId(
                                      item.id
                                    )
                                  }
                                  title={
                                    item.note ||
                                    "Відкрити деталі інгредієнта"
                                  }
                                  className="flex min-w-[275px] items-center gap-3 text-left"
                                >
                                  {item.imageUrl ? (
                                    <div className="relative shrink-0">
                                      <img
                                        src={item.imageUrl}
                                        alt={item.name}
                                        className="size-12 rounded-xl border border-white/10 object-cover"
                                      />

                                      <span
                                        className={`absolute -bottom-1 -right-1 flex size-5 items-center justify-center rounded-md border border-[#1c1512] ${category.iconBox}`}
                                      >
                                        <CategoryIcon className="size-3" />
                                      </span>
                                    </div>
                                  ) : (
                                    <div
                                      className={`flex size-12 shrink-0 items-center justify-center rounded-xl border ${category.iconBox}`}
                                    >
                                      <CategoryIcon className="size-5" />
                                    </div>
                                  )}

                                  <div className="min-w-0">
                                    <div className="truncate text-sm font-medium text-white">
                                      {item.name}
                                    </div>

                                    <div className="mt-1 flex items-center gap-2">
                                      <span
                                        className={`rounded-full border px-2 py-0.5 text-[11px] ${category.badge}`}
                                      >
                                        {category.label}
                                      </span>

                                      {item.note && (
                                        <span className="max-w-[155px] truncate text-xs text-white/28">
                                          {item.note}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </button>
                              </td>

                              <td className="p-4">
                                <span className="inline-flex max-w-[170px] truncate rounded-lg border border-sky-400/15 bg-sky-400/[0.07] px-2.5 py-1.5 text-sm text-sky-200">
                                  {supplier?.name ||
                                    "Без постачальника"}
                                </span>
                              </td>

                              <td className="p-4">
                                <div className="text-sm text-white">
                                  {item.packageUnits ?? 1} ×{" "}
                                  {formatNumber(
                                    item.packageAmount
                                  )}{" "}
                                  {
                                    ingredientUnitLabels[
                                      item.baseUnit
                                    ]
                                  }
                                </div>

                                <div className="mt-1 text-xs text-white/30">
                                  Загалом{" "}
                                  {formatNumber(
                                    (item.packageUnits ?? 1) *
                                      item.packageAmount
                                  )}{" "}
                                  {
                                    ingredientUnitLabels[
                                      item.baseUnit
                                    ]
                                  }
                                </div>
                              </td>

                              <td className="p-4 font-medium">
                                {formatMoney(item.packagePrice)}
                              </td>

                              <td className="p-4">
                                <span
                                  className={`rounded-full border px-3 py-1 text-sm ${
                                    item.wastePercent > 15
                                      ? "border-red-400/15 bg-red-400/8 text-red-300"
                                      : item.wastePercent > 0
                                        ? "border-amber-400/15 bg-amber-400/8 text-amber-300"
                                        : "border-white/10 bg-white/5 text-white/45"
                                  }`}
                                  title="Частина продукту, яка не потрапляє у готову страву"
                                >
                                  {item.wastePercent}%
                                </span>
                              </td>

                              <td className="p-4">
                                <div className="text-sm font-medium text-white">
                                  {formatNumber(netAmount)}{" "}
                                  {
                                    ingredientUnitLabels[
                                      item.baseUnit
                                    ]
                                  }
                                </div>
                              </td>

                              <td className="p-4">
                                <div className="flex min-w-[130px] items-center gap-2">
                                  <span className="size-2 shrink-0 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.35)]" />

                                  <div>
                                    <div className="text-sm font-medium text-white">
                                      {formatMoneyDetailed(
                                        unitCost
                                      )}
                                    </div>

                                    <div className="mt-1 text-xs text-white/30">
                                      за 1{" "}
                                      {
                                        ingredientUnitLabels[
                                          item.baseUnit
                                        ]
                                      }
                                    </div>
                                  </div>
                                </div>
                              </td>

                              <td className="p-3">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() =>
                                    deleteIngredient(item.id)
                                  }
                                  className="text-white/20 opacity-0 transition hover:bg-red-500/10 hover:text-red-300 group-hover:opacity-100"
                                >
                                  <Trash2 className="size-4" />
                                </Button>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                <Dialog
                  open={Boolean(selectedIngredient)}
                  onOpenChange={(open) => {
                    if (!open) {
                      setSelectedIngredientId(null)
                    }
                  }}
                >
                  <DialogContent className="max-h-[90vh] overflow-y-auto border-white/10 bg-[#1c1512] text-white sm:max-w-[720px]">
                    {selectedIngredient && (
                      <>
                        <DialogHeader>
                          <DialogTitle>
                            {selectedIngredient.name}
                          </DialogTitle>

                          <DialogDescription className="text-white/45">
                            Детальна інформація про інгредієнт і
                            закупівельну ціну
                          </DialogDescription>
                        </DialogHeader>

                        <div className="grid gap-5 py-2">
                          <div className="grid gap-5 sm:grid-cols-[190px_1fr]">
                            <div>
                              {selectedIngredient.imageUrl ? (
                                <div className="relative overflow-hidden rounded-2xl border border-white/10">
                                  <img
                                    src={
                                      selectedIngredient.imageUrl
                                    }
                                    alt={
                                      selectedIngredient.name
                                    }
                                    className="h-44 w-full object-cover"
                                  />

                                  <button
                                    type="button"
                                    onClick={() =>
                                      updateIngredient(
                                        selectedIngredient.id,
                                        { imageUrl: "" }
                                      )
                                    }
                                    className="absolute right-2 top-2 flex size-8 items-center justify-center rounded-full bg-black/70 text-white"
                                  >
                                    <X className="size-4" />
                                  </button>
                                </div>
                              ) : (
                                <label className="flex h-44 cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-white/15 bg-white/[0.025] hover:border-[#ff9858]/35">
                                  <ImagePlus className="size-6 text-[#ffae78]" />

                                  <span className="mt-3 text-sm text-white/60">
                                    Додати фото
                                  </span>

                                  <input
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp"
                                    className="hidden"
                                    onChange={(event) => {
                                      const file =
                                        event.target.files?.[0]

                                      if (file) {
                                        readImageFile(
                                          file,
                                          (imageUrl) =>
                                            updateIngredient(
                                              selectedIngredient.id,
                                              { imageUrl }
                                            )
                                        )
                                      }

                                      event.target.value = ""
                                    }}
                                  />
                                </label>
                              )}
                            </div>

                            <div className="grid content-start gap-4">
                              <label>
                                <span className="text-sm text-white/55">
                                  Назва
                                </span>

                                <Input
                                  value={selectedIngredient.name}
                                  onChange={(event) =>
                                    updateIngredient(
                                      selectedIngredient.id,
                                      {
                                        name: event.target.value,
                                      }
                                    )
                                  }
                                  className="mt-2 border-white/10 bg-white/5 text-white"
                                />
                              </label>

                              <label>
                                <span className="text-sm text-white/55">
                                  Тип продукту
                                </span>

                                <Select
                                  value={
                                    selectedIngredient.category ??
                                    inferIngredientCategory(
                                      selectedIngredient.name
                                    )
                                  }
                                  onValueChange={(value) =>
                                    updateIngredient(
                                      selectedIngredient.id,
                                      {
                                        category:
                                          value as IngredientCategory,
                                      }
                                    )
                                  }
                                >
                                  <SelectTrigger className="mt-2 w-full border-white/10 bg-white/5 text-white">
                                    <SelectValue />
                                  </SelectTrigger>

                                  <SelectContent className="border-white/10 bg-[#17100d] text-white">
                                    {ingredientCategoryNames.map(
                                      (categoryName) => {
                                        const meta =
                                          ingredientCategoryMeta[
                                            categoryName
                                          ]
                                        const Icon = meta.icon

                                        return (
                                          <SelectItem
                                            key={categoryName}
                                            value={categoryName}
                                            className="text-white/75 focus:bg-white/10 focus:text-white"
                                          >
                                            <span className="flex items-center gap-3">
                                              <span
                                                className={`flex size-7 items-center justify-center rounded-lg border ${meta.iconBox}`}
                                              >
                                                <Icon className="size-3.5" />
                                              </span>

                                              {meta.label}
                                            </span>
                                          </SelectItem>
                                        )
                                      }
                                    )}
                                  </SelectContent>
                                </Select>
                              </label>

                              <label>
                                <span className="text-sm text-white/55">
                                  Постачальник
                                </span>

                                <select
                                  value={
                                    selectedIngredient.supplierId
                                  }
                                  onChange={(event) =>
                                    updateIngredient(
                                      selectedIngredient.id,
                                      {
                                        supplierId:
                                          event.target.value,
                                      }
                                    )
                                  }
                                  className="mt-2 w-full rounded-xl border border-white/10 bg-[#251b17] px-3 py-2 text-sm text-white"
                                >
                                  <option value="">
                                    Без постачальника
                                  </option>

                                  {state.suppliers.map(
                                    (supplier) => (
                                      <option
                                        key={supplier.id}
                                        value={supplier.id}
                                      >
                                        {supplier.name}
                                      </option>
                                    )
                                  )}
                                </select>
                              </label>
                            </div>
                          </div>

                          <div className="grid gap-4 sm:grid-cols-3">
                            <NumberField
                              label="Кількість у закупці"
                              value={
                                selectedIngredient.packageUnits ??
                                1
                              }
                              onChange={(value) =>
                                updateIngredient(
                                  selectedIngredient.id,
                                  {
                                    packageUnits:
                                      Math.max(1, value),
                                  }
                                )
                              }
                            />

                            <NumberField
                              label="Вага / об’єм 1 одиниці"
                              value={
                                selectedIngredient.packageAmount
                              }
                              onChange={(value) =>
                                updateIngredient(
                                  selectedIngredient.id,
                                  {
                                    packageAmount: value,
                                  }
                                )
                              }
                            />

                            <label>
                              <span className="text-sm text-white/55">
                                Одиниця
                              </span>

                              <select
                                value={selectedIngredient.baseUnit}
                                onChange={(event) =>
                                  updateIngredient(
                                    selectedIngredient.id,
                                    {
                                      baseUnit:
                                        event.target.value as
                                          | "g"
                                          | "ml"
                                          | "pcs",
                                    }
                                  )
                                }
                                className="mt-2 w-full rounded-xl border border-white/10 bg-[#251b17] px-3 py-2 text-sm text-white"
                              >
                                <option value="g">Грами</option>
                                <option value="ml">
                                  Мілілітри
                                </option>
                                <option value="pcs">
                                  Штуки
                                </option>
                              </select>
                            </label>
                          </div>

                          <div className="grid gap-4 sm:grid-cols-2">
                            <NumberField
                              label="Повна ціна закупки"
                              value={
                                selectedIngredient.packagePrice
                              }
                              onChange={(value) =>
                                updateIngredient(
                                  selectedIngredient.id,
                                  {
                                    packagePrice: value,
                                  }
                                )
                              }
                            />

                            <NumberField
                              label="Втрати, %"
                              value={
                                selectedIngredient.wastePercent
                              }
                              onChange={(value) =>
                                updateIngredient(
                                  selectedIngredient.id,
                                  {
                                    wastePercent: Math.min(
                                      99,
                                      Math.max(0, value)
                                    ),
                                  }
                                )
                              }
                            />
                          </div>

                          <label>
                            <span className="text-sm text-white/55">
                              Примітка
                            </span>

                            <textarea
                              value={
                                selectedIngredient.note ?? ""
                              }
                              placeholder="Умови закупки, бренд, сезонність або важливі деталі"
                              onChange={(event) =>
                                updateIngredient(
                                  selectedIngredient.id,
                                  {
                                    note: event.target.value,
                                  }
                                )
                              }
                              className="mt-2 min-h-24 w-full resize-none rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none placeholder:text-white/25"
                            />
                          </label>

                          <div className="grid gap-3 sm:grid-cols-3">
                            <MiniStat
                              label="Загальна закупка"
                              value={`${formatNumber(
                                (selectedIngredient.packageUnits ??
                                  1) *
                                  selectedIngredient.packageAmount
                              )} ${
                                ingredientUnitLabels[
                                  selectedIngredient.baseUnit
                                ]
                              }`}
                            />

                            <MiniStat
                              label="Корисний вихід"
                              value={`${formatNumber(
                                getIngredientNetAmount(
                                  selectedIngredient
                                )
                              )} ${
                                ingredientUnitLabels[
                                  selectedIngredient.baseUnit
                                ]
                              }`}
                            />

                            <MiniStat
                              label="Ціна за одиницю"
                              value={`${formatMoneyDetailed(
                                getIngredientUnitCost(
                                  selectedIngredient
                                )
                              )} / ${
                                ingredientUnitLabels[
                                  selectedIngredient.baseUnit
                                ]
                              }`}
                              accent
                            />
                          </div>
                        </div>

                        <DialogFooter className="mt-2 border-t border-white/10 bg-[#17100d] px-4 py-4">
                          <Button
                            onClick={() =>
                              setSelectedIngredientId(null)
                            }
                            className="bg-[#ff9858] text-[#1a0e08] hover:bg-[#ffad78]"
                          >
                            Готово
                          </Button>
                        </DialogFooter>
                      </>
                    )}
                  </DialogContent>
                </Dialog>

                <Dialog
                  open={ingredientDialogOpen}
                  onOpenChange={setIngredientDialogOpen}
                >
                  <DialogContent className="max-h-[90vh] overflow-y-auto border-white/10 bg-[#1c1512] text-white sm:max-w-[650px]">
                    <DialogHeader>
                      <DialogTitle>
                        Додати інгредієнт
                      </DialogTitle>

                      <DialogDescription className="text-white/45">
                        Вкажи фасування й повну закупівельну ціну.
                        Система автоматично визначить ціну за грам,
                        мілілітр або штуку.
                      </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-5 py-2">
                      <label>
                        <span className="text-sm text-white/55">
                          Назва
                        </span>

                        <Input
                          autoFocus
                          value={newIngredient.name}
                          placeholder="Наприклад: Бурата"
                          onChange={(event) =>
                            setNewIngredient((current) => ({
                              ...current,
                              name: event.target.value,
                            }))
                          }
                          className="mt-2 border-white/10 bg-white/5 text-white"
                        />
                      </label>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <label>
                          <span className="text-sm text-white/55">
                            Тип продукту
                          </span>

                          <Select
                            value={newIngredient.category}
                            onValueChange={(value) =>
                              setNewIngredient((current) => ({
                                ...current,
                                category:
                                  value as IngredientCategory,
                              }))
                            }
                          >
                            <SelectTrigger className="mt-2 w-full border-white/10 bg-white/5 text-white">
                              <SelectValue />
                            </SelectTrigger>

                            <SelectContent className="border-white/10 bg-[#17100d] text-white">
                              {ingredientCategoryNames.map(
                                (categoryName) => {
                                  const meta =
                                    ingredientCategoryMeta[
                                      categoryName
                                    ]
                                  const Icon = meta.icon

                                  return (
                                    <SelectItem
                                      key={categoryName}
                                      value={categoryName}
                                      className="text-white/75 focus:bg-white/10 focus:text-white"
                                    >
                                      <span className="flex items-center gap-3">
                                        <span
                                          className={`flex size-7 items-center justify-center rounded-lg border ${meta.iconBox}`}
                                        >
                                          <Icon className="size-3.5" />
                                        </span>

                                        {meta.label}
                                      </span>
                                    </SelectItem>
                                  )
                                }
                              )}
                            </SelectContent>
                          </Select>
                        </label>

                        <label>
                          <span className="text-sm text-white/55">
                            Постачальник
                          </span>

                          <select
                            value={newIngredient.supplierId}
                            onChange={(event) =>
                              setNewIngredient((current) => ({
                                ...current,
                                supplierId:
                                  event.target.value,
                              }))
                            }
                            className="mt-2 w-full rounded-xl border border-white/10 bg-[#251b17] px-3 py-2 text-sm text-white"
                          >
                            <option value="">
                              Обрати постачальника
                            </option>

                            {state.suppliers.map((supplier) => (
                              <option
                                key={supplier.id}
                                value={supplier.id}
                              >
                                {supplier.name}
                              </option>
                            ))}
                          </select>
                        </label>

                        <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-white/15 bg-white/[0.025] p-4">
                          <ImagePlus className="size-5 text-[#ffae78]" />

                          <span className="mt-2 text-sm text-white/55">
                            {newIngredient.imageUrl
                              ? "Фото додано"
                              : "Додати фото"}
                          </span>

                          <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            className="hidden"
                            onChange={(event) => {
                              const file =
                                event.target.files?.[0]

                              if (file) {
                                readImageFile(
                                  file,
                                  (imageUrl) =>
                                    setNewIngredient(
                                      (current) => ({
                                        ...current,
                                        imageUrl,
                                      })
                                    )
                                )
                              }

                              event.target.value = ""
                            }}
                          />
                        </label>
                      </div>

                      <div className="grid gap-4 sm:grid-cols-3">
                        <NumberField
                          label="Кількість у закупці"
                          value={newIngredient.packageUnits}
                          onChange={(value) =>
                            setNewIngredient((current) => ({
                              ...current,
                              packageUnits: Math.max(1, value),
                            }))
                          }
                        />

                        <NumberField
                          label="Вага / об’єм 1 одиниці"
                          value={newIngredient.packageAmount}
                          onChange={(value) =>
                            setNewIngredient((current) => ({
                              ...current,
                              packageAmount: value,
                            }))
                          }
                        />

                        <label>
                          <span className="text-sm text-white/55">
                            Одиниця
                          </span>

                          <select
                            value={newIngredient.baseUnit}
                            onChange={(event) =>
                              setNewIngredient((current) => ({
                                ...current,
                                baseUnit:
                                  event.target.value as
                                    | "g"
                                    | "ml"
                                    | "pcs",
                              }))
                            }
                            className="mt-2 w-full rounded-xl border border-white/10 bg-[#251b17] px-3 py-2 text-sm text-white"
                          >
                            <option value="g">Грами</option>
                            <option value="ml">
                              Мілілітри
                            </option>
                            <option value="pcs">Штуки</option>
                          </select>
                        </label>
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <NumberField
                          label="Повна ціна закупки"
                          value={newIngredient.packagePrice}
                          onChange={(value) =>
                            setNewIngredient((current) => ({
                              ...current,
                              packagePrice: value,
                            }))
                          }
                        />

                        <NumberField
                          label="Втрати, %"
                          value={newIngredient.wastePercent}
                          onChange={(value) =>
                            setNewIngredient((current) => ({
                              ...current,
                              wastePercent: Math.min(
                                99,
                                Math.max(0, value)
                              ),
                            }))
                          }
                        />
                      </div>

                      <label>
                        <span className="text-sm text-white/55">
                          Примітка
                        </span>

                        <textarea
                          value={newIngredient.note}
                          onChange={(event) =>
                            setNewIngredient((current) => ({
                              ...current,
                              note: event.target.value,
                            }))
                          }
                          className="mt-2 min-h-24 w-full resize-none rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none"
                        />
                      </label>
                    </div>

                    <DialogFooter className="mt-2 border-t border-white/10 bg-[#17100d] px-4 py-4">
                      <Button
                        variant="outline"
                        onClick={() =>
                          setIngredientDialogOpen(false)
                        }
                        className="border-white/10 bg-white/5 text-white hover:bg-white/10 hover:text-white"
                      >
                        Скасувати
                      </Button>

                      <Button
                        onClick={addIngredient}
                        disabled={!newIngredient.name.trim()}
                        className="bg-[#ff9858] text-[#1a0e08] hover:bg-[#ffad78]"
                      >
                        <Plus className="size-4" />
                        Додати інгредієнт
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            )}

            {section === "budget" && (
              <div className="space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="text-sm text-white/45">
                      Редагуй будь-яке значення
                    </div>
                    <div className="mt-1 text-lg font-medium">
                      Загалом: {formatMoney(financials.budgetTotal)}
                    </div>
                  </div>

                  <Button
                    onClick={() => setExpenseDialogOpen(true)}
                    className="bg-[#ff9858] font-medium text-[#1a0e08] hover:bg-[#ffad78]"
                  >
                    <Plus className="size-4" />
                    Додати витрату
                  </Button>
                </div>

                <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#1c1512]">
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[920px] text-left">
                      <thead className="border-b border-white/10 bg-white/[0.025] text-xs uppercase tracking-wide text-white/40">
                        <tr>
                          <th className="p-4 font-normal">Позиція</th>
                          <th className="p-4 font-normal">Категорія</th>
                          <th className="p-4 font-normal">К-сть</th>
                          <th className="p-4 font-normal">Ціна</th>
                          <th className="p-4 font-normal">Разом</th>
                          <th className="p-4 font-normal">Статус</th>
                          <th className="p-4" />
                        </tr>
                      </thead>

                      <tbody>
                        {state.budget.map((item) => {
                          const category =
                            budgetCategories[
                              item.category as BudgetCategory
                            ] ?? budgetCategories["Інше"]

                          const CategoryIcon = category.icon

                          return (
                          <tr
                            key={item.id}
                            className="border-b border-white/8 transition hover:bg-white/[0.025] last:border-0"
                          >
                            <td className="p-3">
                              <div className="flex min-w-[320px] items-start gap-3">
                                <div
                                  className={`mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-xl ${category.iconBox}`}
                                >
                                  <CategoryIcon className="size-4" />
                                </div>

                                <button
                                  type="button"
                                  onClick={() => setSelectedExpenseId(item.id)}
                                  className="min-w-0 flex-1 text-left"
                                >
                                  <div className="truncate text-sm font-medium text-white">
                                    {item.name}
                                  </div>

                                  <div className="mt-1 truncate text-xs text-white/35">
                                    {item.description?.trim()
                                      ? item.description
                                      : "Відкрити деталі"}
                                  </div>
                                </button>
                              </div>
                            </td>

                            <td className="p-3">
                              <Select
                                value={item.category}
                                onValueChange={(value) =>
                                  updateBudgetItem(item.id, {
                                    category: value,
                                  })
                                }
                              >
                                <SelectTrigger
                                  className={`w-[165px] border ${category.badge}`}
                                >
                                  <SelectValue />
                                </SelectTrigger>

                                <SelectContent>
                                  {budgetCategoryNames.map(
                                    (categoryName) => {
                                      const meta =
                                        budgetCategories[categoryName]
                                      const Icon = meta.icon

                                      return (
                                        <SelectItem
                                          key={categoryName}
                                          value={categoryName}
                                        >
                                          <span className="flex items-center gap-3">
                                            <Icon className="size-3.5" />
                                            {categoryName}
                                          </span>
                                        </SelectItem>
                                      )
                                    }
                                  )}
                                </SelectContent>
                              </Select>
                            </td>

                            <td className="p-3">
                              <Input
                                type="number"
                                min="0"
                                value={item.quantity}
                                onChange={(event) =>
                                  updateBudgetItem(item.id, {
                                    quantity:
                                      Number(event.target.value) ||
                                      0,
                                  })
                                }
                                className="w-20 border-white/10 bg-white/5 text-white"
                              />
                            </td>

                            <td className="p-3">
                              <Input
                                type="number"
                                min="0"
                                value={item.unitPrice}
                                onChange={(event) =>
                                  updateBudgetItem(item.id, {
                                    unitPrice:
                                      Number(event.target.value) ||
                                      0,
                                  })
                                }
                                className="w-32 border-white/10 bg-white/5 text-white"
                              />
                            </td>

                            <td className="p-4 font-medium">
                              {formatMoney(
                                item.quantity * item.unitPrice
                              )}
                            </td>

                            <td className="p-3">
                              <Select
                                value={item.status}
                                onValueChange={(value) =>
                                  updateBudgetItem(item.id, {
                                    status:
                                      value as BudgetItem["status"],
                                  })
                                }
                              >
                                <SelectTrigger
                                  className={`w-[150px] border ${
                                    budgetStatusMeta[item.status]
                                      .className
                                  }`}
                                >
                                  <SelectValue>
                                    {budgetStatusMeta[item.status].label}
                                  </SelectValue>
                                </SelectTrigger>

                                <SelectContent className="min-w-[190px] rounded-2xl border-white/10 bg-[#17100d] p-1.5 text-white shadow-[0_18px_60px_rgba(0,0,0,0.55)]">
                          {(
                            Object.entries(
                              budgetStatusMeta
                                    ) as [
                                      BudgetItem["status"],
                                      (typeof budgetStatusMeta)[BudgetItem["status"]]
                                    ][]
                                  ).map(([status, meta]) => (
                                    <SelectItem
                                      key={status}
                                      value={status}
                                      className="my-0.5 rounded-xl py-2.5 pl-3 pr-9 text-white/80 outline-none transition
        focus:bg-[#f4e1d2] focus:text-[#1a0e08]
        data-[highlighted]:bg-[#f4e1d2] data-[highlighted]:text-[#1a0e08]
        data-[state=checked]:bg-[#ffeddc] data-[state=checked]:text-[#1a0e08]"
                                    >
                                      <span className="flex items-center gap-3">
                                        <span
                                          className={`size-2.5 rounded-full ${
                                            status === "planned"
                                              ? "bg-white/45 ring-4 ring-white/5"
                                              : status === "quoted"
                                                ? "bg-sky-400 ring-4 ring-sky-400/10"
                                                : status === "ordered"
                                                  ? "bg-orange-400 ring-4 ring-orange-400/10"
                                                  : "bg-emerald-400 ring-4 ring-emerald-400/10"
                                          }`}
                                        />
                                        {meta.label}
                                      </span>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </td>

                            <td className="p-3">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() =>
                                  setState((current) => ({
                                    ...current,
                                    budget:
                                      current.budget.filter(
                                        (currentItem) =>
                                          currentItem.id !==
                                          item.id
                                      ),
                                  }))
                                }
                                className="text-white/40 hover:bg-red-500/10 hover:text-red-300"
                              >
                                <Trash2 className="size-4" />
                              </Button>
                            </td>
                          </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
            {section === "menu" && (() => {
              const monthlyRevenue = state.menu.reduce(
                (sum, item) =>
                  sum +
                  item.sellingPrice *
                    item.dailySales *
                    state.settings.workingDays,
                0
              )

              const monthlyProductCosts = state.menu.reduce(
                (sum, item) =>
                  sum +
                  getMenuItemDirectCost(state, item) *
                    item.dailySales *
                    state.settings.workingDays,
                0
              )

              const monthlyGrossMargin =
                monthlyRevenue - monthlyProductCosts

              const monthlyFees =
                monthlyRevenue *
                ((state.settings.acquiringPercent +
                  state.settings.taxPercent) /
                  100)

              const monthlyOperatingProfit =
                monthlyGrossMargin -
                financials.fixedCosts -
                monthlyFees

              const foodCount = state.menu.filter(
                (item) => (item.menuType ?? "food") === "food"
              ).length

              const drinkCount = state.menu.filter(
                (item) => item.menuType === "drink"
              ).length

              const filteredMenu = state.menu.filter(
                (item) => {
                  if (menuFilter === "all") return true

                  return (
                    (item.menuType ?? "food") === menuFilter
                  )
                }
              )

              return (
                <div className="space-y-6">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <div className="text-sm text-white/45">
                        Рецепти, ціни й план продажів
                      </div>

                      <div className="mt-1 text-lg font-medium">
                        Економіка меню
                      </div>
                    </div>

                    <Button
                      onClick={() =>
                        setMenuItemDialogOpen(true)
                      }
                      className="bg-[#ff9858] text-[#1a0e08] hover:bg-[#ffad78]"
                    >
                      <Plus className="size-4" />
                      Додати позицію
                    </Button>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    {[
                      {
                        id: "all" as const,
                        label: "Усі",
                        count: state.menu.length,
                        icon: LayoutGrid,
                      },
                      {
                        id: "food" as const,
                        label: "Брускети",
                        count: foodCount,
                        icon: Sandwich,
                      },
                      {
                        id: "drink" as const,
                        label: "Напої",
                        count: drinkCount,
                        icon: Wine,
                      },
                    ].map((filter) => {
                      const active =
                        menuFilter === filter.id

                      const FilterIcon =
                        filter.icon

                      return (
                        <button
                          key={filter.id}
                          type="button"
                          onClick={() =>
                            setMenuFilter(filter.id)
                          }
                          className={`group flex items-center gap-2.5 rounded-2xl border px-4 py-3 text-sm font-medium transition ${
                            active
                              ? "border-[#ff9858]/45 bg-[#ff9858]/12 text-[#ffae78] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
                              : "border-white/10 bg-white/[0.025] text-white/45 hover:border-white/15 hover:bg-white/[0.05] hover:text-white/75"
                          }`}
                        >
                          <FilterIcon
                            className={`size-4 shrink-0 transition ${
                              active
                                ? "text-[#ff9858]"
                                : "text-white/35 group-hover:text-white/60"
                            }`}
                          />

                          <span>
                            {filter.label}
                          </span>

                          <span
                            className={`flex min-w-6 items-center justify-center rounded-full px-1.5 py-0.5 text-[11px] ${
                              active
                                ? "bg-[#ff9858]/15 text-[#ffae78]"
                                : "bg-white/[0.06] text-white/30"
                            }`}
                          >
                            {filter.count}
                          </span>
                        </button>
                      )
                    })}
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <Card className="overflow-hidden border-sky-400/20 bg-gradient-to-br from-[#14212b] to-[#11171c] text-white">
                      <div className="relative p-5">
                        <div className="absolute -right-8 -top-8 size-24 rounded-full bg-sky-400/10 blur-2xl" />

                        <div className="flex items-center justify-between">
                          <span className="text-sm text-sky-100/50">
                            Виручка / місяць
                          </span>

                          <div className="flex size-9 items-center justify-center rounded-xl bg-sky-400/10 text-sky-300">
                            <ReceiptText className="size-4" />
                          </div>
                        </div>

                        <div className="mt-5 text-2xl font-medium">
                          {formatMoney(monthlyRevenue)}
                        </div>

                        <div className="mt-1 text-xs text-white/35">
                          Усі продажі до вирахування витрат
                        </div>
                      </div>
                    </Card>

                    <Card className="overflow-hidden border-orange-400/20 bg-gradient-to-br from-[#2b1b13] to-[#1a120e] text-white">
                      <div className="relative p-5">
                        <div className="absolute -right-8 -top-8 size-24 rounded-full bg-orange-400/10 blur-2xl" />

                        <div className="flex items-center justify-between">
                          <span className="text-sm text-orange-100/50">
                            Продукти / місяць
                          </span>

                          <div className="flex size-9 items-center justify-center rounded-xl bg-orange-400/10 text-orange-300">
                            <ShoppingBasket className="size-4" />
                          </div>
                        </div>

                        <div className="mt-5 text-2xl font-medium">
                          {formatMoney(monthlyProductCosts)}
                        </div>

                        <div className="mt-1 text-xs text-white/35">
                          Розраховано з рецептів
                        </div>
                      </div>
                    </Card>

                    <Card className="overflow-hidden border-violet-400/20 bg-gradient-to-br from-[#21172a] to-[#161119] text-white">
                      <div className="relative p-5">
                        <div className="absolute -right-8 -top-8 size-24 rounded-full bg-violet-400/10 blur-2xl" />

                        <div className="flex items-center justify-between">
                          <span className="text-sm text-violet-100/50">
                            Валова маржа
                          </span>

                          <div className="flex size-9 items-center justify-center rounded-xl bg-violet-400/10 text-violet-300">
                            <ChartNoAxesCombined className="size-4" />
                          </div>
                        </div>

                        <div className="mt-5 text-2xl font-medium">
                          {formatMoney(monthlyGrossMargin)}
                        </div>

                        <div className="mt-1 text-xs text-white/35">
                          Виручка мінус продукти
                        </div>
                      </div>
                    </Card>

                    <Card
                      className={`overflow-hidden text-white ${
                        monthlyOperatingProfit >= 0
                          ? "border-emerald-400/20 bg-gradient-to-br from-[#14231c] to-[#101713]"
                          : "border-red-400/20 bg-gradient-to-br from-[#291616] to-[#181010]"
                      }`}
                    >
                      <div className="relative p-5">
                        <div
                          className={`absolute -right-8 -top-8 size-24 rounded-full blur-2xl ${
                            monthlyOperatingProfit >= 0
                              ? "bg-emerald-400/10"
                              : "bg-red-400/10"
                          }`}
                        />

                        <div className="flex items-center justify-between">
                          <span
                            className={`text-sm ${
                              monthlyOperatingProfit >= 0
                                ? "text-emerald-100/50"
                                : "text-red-100/50"
                            }`}
                          >
                            Операційний прибуток
                          </span>

                          <div
                            className={`flex size-9 items-center justify-center rounded-xl ${
                              monthlyOperatingProfit >= 0
                                ? "bg-emerald-400/10 text-emerald-300"
                                : "bg-red-400/10 text-red-300"
                            }`}
                          >
                            <Coins className="size-4" />
                          </div>
                        </div>

                        <div className="mt-5 text-2xl font-medium">
                          {formatMoney(
                            monthlyOperatingProfit
                          )}
                        </div>

                        <div className="mt-1 text-xs text-white/35">
                          Після продуктів, податків і постійних витрат
                        </div>
                      </div>
                    </Card>
                  </div>

                  <div className="space-y-3">
                    {filteredMenu.map((item) => {
                      const directCost =
                        getMenuItemDirectCost(state, item)

                      const foodCost =
                        item.sellingPrice > 0
                          ? (directCost /
                              item.sellingPrice) *
                            100
                          : 0

                      const monthlyUnits =
                        item.dailySales *
                        state.settings.workingDays

                      const itemMonthlyRevenue =
                        item.sellingPrice * monthlyUnits

                      const itemMonthlyCosts =
                        directCost * monthlyUnits

                      const itemGrossMargin =
                        itemMonthlyRevenue -
                        itemMonthlyCosts

                      const accentKey =
                        (item.accent as MenuAccent) ??
                        "tomato"

                      const accent =
                        menuAccentMeta[accentKey] ??
                        menuAccentMeta.tomato

                      const MenuIcon = getMenuItemIcon(
                        item,
                        state
                      )

                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() =>
                            setSelectedMenuItemId(item.id)
                          }
                          className={`group relative grid w-full gap-5 overflow-hidden rounded-2xl border p-5 text-left transition hover:-translate-y-0.5 hover:shadow-[0_16px_45px_rgba(0,0,0,0.18)] lg:grid-cols-[minmax(260px,1fr)_minmax(460px,1.5fr)] ${accent.border} ${accent.background}`}
                        >
                          <span
                            className={`absolute inset-y-4 left-0 w-[3px] rounded-full ${accent.line}`}
                          />

                          <div className="flex min-w-0 items-center gap-4 pl-2">
                            {item.imageUrl ? (
                              <img
                                src={item.imageUrl}
                                alt={item.name}
                                className="size-16 shrink-0 rounded-2xl border border-white/10 object-cover"
                              />
                            ) : (
                              <div
                                className={`flex size-16 shrink-0 items-center justify-center rounded-2xl border ${accent.icon}`}
                              >
                                <MenuIcon className="size-6" />
                              </div>
                            )}

                            <div className="min-w-0">
                              <div className="truncate font-medium text-white">
                                {item.name}
                              </div>

                              <div className="mt-2 flex flex-wrap items-center gap-2">
                                <span
                                  className={`rounded-full px-2.5 py-1 text-xs ${accent.badge}`}
                                >
                                  {item.menuType === "drink"
                                    ? item.drinkKind
                                      ? drinkKindMeta[
                                          item.drinkKind
                                        ].label
                                      : "Напій"
                                    : `${item.recipe.length} інгредієнтів`}
                                </span>

                                <span className="text-xs text-white/35">
                                  {formatNumber(item.dailySales)} продажів / день
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                            <MenuValue
                              label="Ціна"
                              value={formatMoney(
                                item.sellingPrice
                              )}
                            />

                            <MenuValue
                              label="Собівартість"
                              value={formatMoneyDetailed(
                                directCost
                              )}
                            />

                            <MenuValue
                              label={
                                item.menuType === "drink"
                                  ? "Beverage Cost"
                                  : "Food Cost"
                              }
                              value={`${formatNumber(
                                foodCost
                              )}%`}
                              tone={
                                foodCost <= 35
                                  ? "good"
                                  : foodCost <= 40
                                    ? "warning"
                                    : "danger"
                              }
                            />

                            <MenuValue
                              label="Маржа / місяць"
                              value={formatMoney(
                                itemGrossMargin
                              )}
                              tone="good"
                            />
                          </div>
                        </button>
                      )
                    })}
                  </div>

                  {filteredMenu.length === 0 && (
                    <div className="rounded-2xl border border-dashed border-white/15 bg-white/[0.025] p-12 text-center">
                      <CookingPot className="mx-auto size-8 text-white/25" />

                      <div className="mt-4 font-medium">
                        У меню ще немає позицій
                      </div>

                      <div className="mt-2 text-sm text-white/40">
                        Додай першу брускету та сформуй її рецепт.
                      </div>
                    </div>
                  )}

                  <Dialog
                    open={Boolean(selectedMenuItem)}
                    onOpenChange={(open) => {
                      if (!open) {
                        setSelectedMenuItemId(null)
                      }
                    }}
                  >
                    <DialogContent className="max-h-[92vh] overflow-y-auto border-white/10 bg-[#1c1512] text-white sm:max-w-[920px]">
                      {selectedMenuItem && (() => {
                        const directCost =
                          getMenuItemDirectCost(
                            state,
                            selectedMenuItem
                          )

                        const foodCost =
                          selectedMenuItem.sellingPrice > 0
                            ? (directCost /
                                selectedMenuItem.sellingPrice) *
                              100
                            : 0

                        const monthlyUnits =
                          selectedMenuItem.dailySales *
                          state.settings.workingDays

                        const monthlyRevenue =
                          selectedMenuItem.sellingPrice *
                          monthlyUnits

                        const monthlyProductCosts =
                          directCost * monthlyUnits

                        const grossMargin =
                          monthlyRevenue -
                          monthlyProductCosts

                        const accentKey =
                          (selectedMenuItem.accent as MenuAccent) ??
                          "tomato"

                        const accent =
                          menuAccentMeta[accentKey] ??
                          menuAccentMeta.tomato

                        return (
                          <>
                            <DialogHeader>
                              <DialogTitle>
                                Картка позиції
                              </DialogTitle>

                              <DialogDescription className="text-white/45">
                                Рецепт, актуальна собівартість і
                                прогноз продажів
                              </DialogDescription>
                            </DialogHeader>

                            <div className="grid gap-6 py-2">
                              <div className="grid gap-5 md:grid-cols-[220px_1fr]">
                                <div>
                                  {selectedMenuItem.imageUrl ? (
                                    <div className="relative overflow-hidden rounded-2xl border border-white/10">
                                      <img
                                        src={
                                          selectedMenuItem.imageUrl
                                        }
                                        alt={
                                          selectedMenuItem.name
                                        }
                                        className="h-52 w-full object-cover"
                                      />

                                      <button
                                        type="button"
                                        onClick={() =>
                                          updateMenuItem(
                                            selectedMenuItem.id,
                                            { imageUrl: "" }
                                          )
                                        }
                                        className="absolute right-2 top-2 flex size-8 items-center justify-center rounded-full bg-black/70 text-white"
                                      >
                                        <X className="size-4" />
                                      </button>
                                    </div>
                                  ) : (
                                    <label
                                      className={`flex h-52 cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed ${accent.border} ${accent.background}`}
                                    >
                                      <ImagePlus className="size-7 text-[#ffae78]" />

                                      <span className="mt-3 text-sm text-white/60">
                                        Додати фото позиції
                                      </span>

                                      <input
                                        type="file"
                                        accept="image/jpeg,image/png,image/webp"
                                        className="hidden"
                                        onChange={(event) => {
                                          const file =
                                            event.target
                                              .files?.[0]

                                          if (file) {
                                            readImageFile(
                                              file,
                                              (imageUrl) =>
                                                updateMenuItem(
                                                  selectedMenuItem.id,
                                                  {
                                                    imageUrl,
                                                  }
                                                )
                                            )
                                          }

                                          event.target.value = ""
                                        }}
                                      />
                                    </label>
                                  )}
                                </div>

                                <div className="grid content-start gap-4">
                                  <label>
                                    <span className="text-sm text-white/55">
                                      Назва позиції
                                    </span>

                                    <Input
                                      value={
                                        selectedMenuItem.name
                                      }
                                      onChange={(event) =>
                                        updateMenuItem(
                                          selectedMenuItem.id,
                                          {
                                            name: event.target
                                              .value,
                                          }
                                        )
                                      }
                                      className="mt-2 border-white/10 bg-white/5 text-white"
                                    />
                                  </label>

                                  <div className="grid gap-4 sm:grid-cols-2">
                                    <label>
                                      <span className="text-sm text-white/55">
                                        Тип позиції
                                      </span>

                                      <Select
                                        value={
                                          selectedMenuItem.menuType ??
                                          "food"
                                        }
                                        onValueChange={(value) =>
                                          updateMenuItem(
                                            selectedMenuItem.id,
                                            {
                                              menuType:
                                                value as MenuItemType,
                                              drinkKind:
                                                value === "drink"
                                                  ? selectedMenuItem.drinkKind ??
                                                    "lemonade"
                                                  : undefined,
                                            }
                                          )
                                        }
                                      >
                                        <SelectTrigger className="mt-2 w-full border-white/10 bg-white/5 text-white">
                                          <SelectValue />
                                        </SelectTrigger>

                                        <SelectContent className="border-white/10 bg-[#17100d] text-white">
                                          <SelectItem value="food">
                                            Брускета / їжа
                                          </SelectItem>

                                          <SelectItem value="drink">
                                            Напій
                                          </SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </label>

                                    {(selectedMenuItem.menuType ??
                                      "food") === "drink" && (
                                      <label>
                                        <span className="text-sm text-white/55">
                                          Вид напою
                                        </span>

                                        <Select
                                          value={
                                            selectedMenuItem.drinkKind ??
                                            "lemonade"
                                          }
                                          onValueChange={(value) =>
                                            updateMenuItem(
                                              selectedMenuItem.id,
                                              {
                                                drinkKind:
                                                  value as DrinkKind,
                                                accent:
                                                  drinkKindMeta[
                                                    value as DrinkKind
                                                  ].accent,
                                              }
                                            )
                                          }
                                        >
                                          <SelectTrigger className="mt-2 w-full border-white/10 bg-white/5 text-white">
                                            <SelectValue />
                                          </SelectTrigger>

                                          <SelectContent className="border-white/10 bg-[#17100d] text-white">
                                            {drinkKindNames.map(
                                              (kind) => (
                                                <SelectItem
                                                  key={kind}
                                                  value={kind}
                                                >
                                                  {
                                                    drinkKindMeta[
                                                      kind
                                                    ].label
                                                  }
                                                </SelectItem>
                                              )
                                            )}
                                          </SelectContent>
                                        </Select>
                                      </label>
                                    )}
                                  </div>

                                  <div className="grid gap-4 sm:grid-cols-2">
                                    <label>
                                      <span className="text-sm text-white/55">
                                        Ціна за порцію
                                      </span>

                                      <Input
                                        type="number"
                                        min="0"
                                        value={
                                          selectedMenuItem.sellingPrice
                                        }
                                        onChange={(event) =>
                                          updateMenuItem(
                                            selectedMenuItem.id,
                                            {
                                              sellingPrice:
                                                Number(
                                                  event.target
                                                    .value
                                                ) || 0,
                                            }
                                          )
                                        }
                                        className="mt-2 border-white/10 bg-white/5 text-white"
                                      />
                                    </label>

                                    <label>
                                      <span className="text-sm text-white/55">
                                        Продажів на день
                                      </span>

                                      <Input
                                        type="number"
                                        min="0"
                                        value={
                                          selectedMenuItem.dailySales
                                        }
                                        onChange={(event) =>
                                          updateMenuItem(
                                            selectedMenuItem.id,
                                            {
                                              dailySales:
                                                Number(
                                                  event.target
                                                    .value
                                                ) || 0,
                                            }
                                          )
                                        }
                                        className="mt-2 border-white/10 bg-white/5 text-white"
                                      />
                                    </label>
                                  </div>

                                  <div className="grid gap-4 sm:grid-cols-2">
                                    <label>
                                      <span className="text-sm text-white/55">
                                        Акцентний колір
                                      </span>

                                      <Select
                                        value={accentKey}
                                        onValueChange={(
                                          value
                                        ) =>
                                          updateMenuItem(
                                            selectedMenuItem.id,
                                            {
                                              accent: value,
                                            }
                                          )
                                        }
                                      >
                                        <SelectTrigger className="mt-2 w-full border-white/10 bg-white/5 text-white">
                                          <SelectValue />
                                        </SelectTrigger>

                                        <SelectContent className="border-white/10 bg-[#17100d] text-white">
                                          {menuAccentNames.map(
                                            (accentName) => {
                                              const meta =
                                                menuAccentMeta[
                                                  accentName
                                                ]

                                              return (
                                                <SelectItem
                                                  key={
                                                    accentName
                                                  }
                                                  value={
                                                    accentName
                                                  }
                                                  className="text-white/75 focus:bg-white/10 focus:text-white"
                                                >
                                                  <span className="flex items-center gap-3">
                                                    <span
                                                      className={`size-3 rounded-full ${meta.line}`}
                                                    />
                                                    {
                                                      meta.label
                                                    }
                                                  </span>
                                                </SelectItem>
                                              )
                                            }
                                          )}
                                        </SelectContent>
                                      </Select>
                                    </label>

                                    <label>
                                      <span className="text-sm text-white/55">
                                        Інші прямі витрати
                                      </span>

                                      <Input
                                        type="number"
                                        min="0"
                                        value={
                                          selectedMenuItem.extraCost
                                        }
                                        onChange={(event) =>
                                          updateMenuItem(
                                            selectedMenuItem.id,
                                            {
                                              extraCost:
                                                Number(
                                                  event.target
                                                    .value
                                                ) || 0,
                                            }
                                          )
                                        }
                                        className="mt-2 border-white/10 bg-white/5 text-white"
                                      />

                                      <div className="mt-1 text-xs text-white/30">
                                        Для витрат, яких ще немає
                                        серед інгредієнтів
                                      </div>
                                    </label>
                                  </div>
                                </div>
                              </div>

                              <div>
                                <div className="mb-3 flex items-center justify-between gap-3">
                                  <div>
                                    <div className="font-medium">
                                      Рецепт
                                    </div>

                                    <div className="mt-1 text-sm text-white/40">
                                      Собівартість кожного рядка
                                      розраховується автоматично
                                    </div>
                                  </div>

                                  <Button
                                    variant="outline"
                                    onClick={() =>
                                      addRecipeLine(
                                        selectedMenuItem.id
                                      )
                                    }
                                    disabled={
                                      state.ingredients.length ===
                                      0
                                    }
                                    className="border-[#ff9858]/20 bg-[#ff9858]/8 text-[#ffae78] hover:bg-[#ff9858]/12 hover:text-[#ffc39b]"
                                  >
                                    <Plus className="size-4" />
                                    Додати інгредієнт
                                  </Button>
                                </div>

                                <div className="overflow-hidden rounded-2xl border border-white/10">
                                  <div className="grid grid-cols-[1fr_120px_140px_44px] gap-3 border-b border-white/10 bg-white/[0.025] px-4 py-3 text-xs uppercase tracking-wide text-white/35">
                                    <span>Інгредієнт</span>
                                    <span>Кількість</span>
                                    <span>Ціна закупки</span>
                                    <span />
                                  </div>

                                  {selectedMenuItem.recipe.map(
                                    (line) => {
                                      const ingredient =
                                        state.ingredients.find(
                                          (item) =>
                                            item.id ===
                                            line.ingredientId
                                        )

                                      const lineCost =
                                        ingredient
                                          ? getIngredientUnitCost(
                                              ingredient
                                            ) * line.amount
                                          : 0

                                      return (
                                        <div
                                          key={line.id}
                                          className="grid grid-cols-[1fr_120px_140px_44px] items-center gap-3 border-b border-white/8 px-4 py-3 last:border-0"
                                        >
                                          <Select
                                            value={
                                              line.ingredientId
                                            }
                                            onValueChange={(
                                              value
                                            ) =>
                                              updateRecipeLine(
                                                selectedMenuItem.id,
                                                line.id,
                                                {
                                                  ingredientId:
                                                    value,
                                                }
                                              )
                                            }
                                          >
                                            <SelectTrigger className="w-full border-white/10 bg-white/5 text-white">
                                              <SelectValue />
                                            </SelectTrigger>

                                            <SelectContent className="max-h-[320px] border-white/10 bg-[#17100d] text-white">
                                              {state.ingredients.map(
                                                (
                                                  currentIngredient
                                                ) => (
                                                  <SelectItem
                                                    key={
                                                      currentIngredient.id
                                                    }
                                                    value={
                                                      currentIngredient.id
                                                    }
                                                    className="text-white/75 focus:bg-white/10 focus:text-white"
                                                  >
                                                    {
                                                      currentIngredient.name
                                                    }
                                                  </SelectItem>
                                                )
                                              )}
                                            </SelectContent>
                                          </Select>

                                          <div className="relative">
                                            <Input
                                              type="number"
                                              min="0"
                                              step="0.1"
                                              value={line.amount}
                                              onChange={(
                                                event
                                              ) =>
                                                updateRecipeLine(
                                                  selectedMenuItem.id,
                                                  line.id,
                                                  {
                                                    amount:
                                                      Number(
                                                        event
                                                          .target
                                                          .value
                                                      ) || 0,
                                                  }
                                                )
                                              }
                                              className="border-white/10 bg-white/5 pr-10 text-white"
                                            />

                                            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-white/30">
                                              {ingredient
                                                ? ingredientUnitLabels[
                                                    ingredient
                                                      .baseUnit
                                                  ]
                                                : ""}
                                            </span>
                                          </div>

                                          <div className="relative">
                                            <Input
                                              type="number"
                                              min="0"
                                              step="0.01"
                                              value={
                                                ingredient?.packagePrice ??
                                                ""
                                              }
                                              placeholder="0"
                                              disabled={!ingredient}
                                              onChange={(event) => {
                                                if (!ingredient) return

                                                updateIngredient(
                                                  ingredient.id,
                                                  {
                                                    packagePrice:
                                                      Math.max(
                                                        0,
                                                        Number(
                                                          event.target.value
                                                        ) || 0
                                                      ),
                                                  }
                                                )
                                              }}
                                              className="border-white/10 bg-white/5 pr-8 text-white disabled:opacity-40"
                                            />

                                            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-white/30">
                                              ₴
                                            </span>
                                          </div>

                                          <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() =>
                                              deleteRecipeLine(
                                                selectedMenuItem.id,
                                                line.id
                                              )
                                            }
                                            className="text-white/25 hover:bg-red-500/10 hover:text-red-300"
                                          >
                                            <Trash2 className="size-4" />
                                          </Button>
                                        </div>
                                      )
                                    }
                                  )}

                                  {selectedMenuItem.recipe
                                    .length === 0 && (
                                    <div className="px-5 py-10 text-center text-sm text-white/35">
                                      Рецепт порожній. Додай
                                      перший інгредієнт.
                                    </div>
                                  )}
                                </div>
                              </div>

                              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                                <MenuSummary
                                  label="Собівартість"
                                  value={formatMoneyDetailed(
                                    directCost
                                  )}
                                />

                                <MenuSummary
                                  label={
                                    selectedMenuItem.menuType ===
                                    "drink"
                                      ? "Beverage Cost"
                                      : "Food Cost"
                                  }
                                  value={`${formatNumber(
                                    foodCost
                                  )}%`}
                                  tone={
                                    foodCost <= 35
                                      ? "good"
                                      : foodCost <= 40
                                        ? "warning"
                                        : "danger"
                                  }
                                />

                                <MenuSummary
                                  label="Виручка"
                                  value={formatMoney(
                                    monthlyRevenue
                                  )}
                                />

                                <MenuSummary
                                  label="Продукти"
                                  value={formatMoney(
                                    monthlyProductCosts
                                  )}
                                />

                                <MenuSummary
                                  label="Валова маржа"
                                  value={formatMoney(
                                    grossMargin
                                  )}
                                  tone="good"
                                />
                              </div>
                            </div>

                            <DialogFooter className="mt-2 flex border-t border-white/10 bg-[#17100d] px-4 py-4 sm:justify-between">
                              <Button
                                variant="ghost"
                                onClick={() => {
                                  setState((current) => ({
                                    ...current,
                                    menu: current.menu.filter(
                                      (item) =>
                                        item.id !==
                                        selectedMenuItem.id
                                    ),
                                  }))

                                  setSelectedMenuItemId(null)
                                }}
                                className="border border-red-400/15 bg-red-400/[0.06] text-red-300 hover:bg-red-400/10 hover:text-red-200"
                              >
                                <Trash2 className="size-4" />
                                Видалити позицію
                              </Button>

                              <Button
                                onClick={() =>
                                  setSelectedMenuItemId(null)
                                }
                                className="bg-[#ff9858] text-[#1a0e08] hover:bg-[#ffad78]"
                              >
                                <Save className="size-4" />
                                Готово
                              </Button>
                            </DialogFooter>
                          </>
                        )
                      })()}
                    </DialogContent>
                  </Dialog>

                  <Dialog
                    open={menuItemDialogOpen}
                    onOpenChange={setMenuItemDialogOpen}
                  >
                    <DialogContent className="max-h-[92vh] overflow-y-auto border-white/10 bg-[#1c1512] text-white sm:max-w-[760px]">
                      <DialogHeader>
                        <DialogTitle>
                          Додати позицію меню
                        </DialogTitle>

                        <DialogDescription className="text-white/45">
                          Створи позицію та сформуй базовий рецепт.
                          Усі розрахунки підтягнуться автоматично.
                        </DialogDescription>
                      </DialogHeader>

                      <div className="grid gap-5 py-2">
                        <div className="grid gap-5 sm:grid-cols-[170px_1fr]">
                          <div>
                            {newMenuItem.imageUrl ? (
                              <div className="relative overflow-hidden rounded-2xl border border-white/10">
                                <img
                                  src={newMenuItem.imageUrl}
                                  alt="Нова позиція"
                                  className="h-40 w-full object-cover"
                                />

                                <button
                                  type="button"
                                  onClick={() =>
                                    setNewMenuItem(
                                      (current) => ({
                                        ...current,
                                        imageUrl: "",
                                      })
                                    )
                                  }
                                  className="absolute right-2 top-2 flex size-8 items-center justify-center rounded-full bg-black/70 text-white"
                                >
                                  <X className="size-4" />
                                </button>
                              </div>
                            ) : (
                              <label className="flex h-40 cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-white/15 bg-white/[0.025] hover:border-[#ff9858]/30">
                                <ImagePlus className="size-6 text-[#ffae78]" />

                                <span className="mt-3 text-sm text-white/55">
                                  Додати фото
                                </span>

                                <input
                                  type="file"
                                  accept="image/jpeg,image/png,image/webp"
                                  className="hidden"
                                  onChange={(event) => {
                                    const file =
                                      event.target.files?.[0]

                                    if (file) {
                                      readImageFile(
                                        file,
                                        (imageUrl) =>
                                          setNewMenuItem(
                                            (current) => ({
                                              ...current,
                                              imageUrl,
                                            })
                                          )
                                      )
                                    }

                                    event.target.value = ""
                                  }}
                                />
                              </label>
                            )}
                          </div>

                          <div className="grid content-start gap-4">
                            <label>
                              <span className="text-sm text-white/55">
                                Назва позиції
                              </span>

                              <Input
                                autoFocus
                                value={newMenuItem.name}
                                placeholder="Наприклад: Кавун / фета / м’ята"
                                onChange={(event) =>
                                  setNewMenuItem(
                                    (current) => ({
                                      ...current,
                                      name: event.target.value,
                                    })
                                  )
                                }
                                className="mt-2 border-white/10 bg-white/5 text-white"
                              />
                            </label>

                            <div className="grid gap-4 sm:grid-cols-2">
                              <label>
                                <span className="text-sm text-white/55">
                                  Тип позиції
                                </span>

                                <Select
                                  value={newMenuItem.menuType}
                                  onValueChange={(value) =>
                                    setNewMenuItem(
                                      (current) => ({
                                        ...current,
                                        menuType:
                                          value as MenuItemType,
                                        drinkKind:
                                          value === "drink"
                                            ? current.drinkKind
                                            : "lemonade",
                                        accent:
                                          value === "drink"
                                            ? drinkKindMeta[
                                                current.drinkKind
                                              ].accent
                                            : "tomato",
                                      })
                                    )
                                  }
                                >
                                  <SelectTrigger className="mt-2 w-full border-white/10 bg-white/5 text-white">
                                    <SelectValue />
                                  </SelectTrigger>

                                  <SelectContent className="border-white/10 bg-[#17100d] text-white">
                                    <SelectItem value="food">
                                      Брускета / їжа
                                    </SelectItem>

                                    <SelectItem value="drink">
                                      Напій
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                              </label>

                              {newMenuItem.menuType ===
                                "drink" && (
                                <label>
                                  <span className="text-sm text-white/55">
                                    Вид напою
                                  </span>

                                  <Select
                                    value={
                                      newMenuItem.drinkKind
                                    }
                                    onValueChange={(value) =>
                                      setNewMenuItem(
                                        (current) => ({
                                          ...current,
                                          drinkKind:
                                            value as DrinkKind,
                                          accent:
                                            drinkKindMeta[
                                              value as DrinkKind
                                            ].accent,
                                        })
                                      )
                                    }
                                  >
                                    <SelectTrigger className="mt-2 w-full border-white/10 bg-white/5 text-white">
                                      <SelectValue />
                                    </SelectTrigger>

                                    <SelectContent className="border-white/10 bg-[#17100d] text-white">
                                      {drinkKindNames.map(
                                        (kind) => (
                                          <SelectItem
                                            key={kind}
                                            value={kind}
                                          >
                                            {
                                              drinkKindMeta[
                                                kind
                                              ].label
                                            }
                                          </SelectItem>
                                        )
                                      )}
                                    </SelectContent>
                                  </Select>
                                </label>
                              )}
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                              <NumberField
                                label="Ціна за порцію"
                                value={
                                  newMenuItem.sellingPrice
                                }
                                onChange={(value) =>
                                  setNewMenuItem(
                                    (current) => ({
                                      ...current,
                                      sellingPrice: value,
                                    })
                                  )
                                }
                              />

                              <NumberField
                                label="Продажів на день"
                                value={newMenuItem.dailySales}
                                onChange={(value) =>
                                  setNewMenuItem(
                                    (current) => ({
                                      ...current,
                                      dailySales: value,
                                    })
                                  )
                                }
                              />
                            </div>

                            <label>
                              <span className="text-sm text-white/55">
                                Акцентний колір
                              </span>

                              <Select
                                value={newMenuItem.accent}
                                onValueChange={(value) =>
                                  setNewMenuItem(
                                    (current) => ({
                                      ...current,
                                      accent:
                                        value as MenuAccent,
                                    })
                                  )
                                }
                              >
                                <SelectTrigger className="mt-2 w-full border-white/10 bg-white/5 text-white">
                                  <SelectValue />
                                </SelectTrigger>

                                <SelectContent className="border-white/10 bg-[#17100d] text-white">
                                  {menuAccentNames.map(
                                    (accentName) => {
                                      const meta =
                                        menuAccentMeta[
                                          accentName
                                        ]

                                      return (
                                        <SelectItem
                                          key={accentName}
                                          value={accentName}
                                          className="text-white/75 focus:bg-white/10 focus:text-white"
                                        >
                                          <span className="flex items-center gap-3">
                                            <span
                                              className={`size-3 rounded-full ${meta.line}`}
                                            />
                                            {meta.label}
                                          </span>
                                        </SelectItem>
                                      )
                                    }
                                  )}
                                </SelectContent>
                              </Select>
                            </label>
                          </div>
                        </div>

                        <div>
                          <div className="mb-3 flex items-center justify-between">
                            <div>
                              <div className="font-medium">
                                Базовий рецепт
                              </div>

                              <div className="mt-1 text-sm text-white/35">
                                Його можна доповнити після створення
                              </div>
                            </div>

                            <Button
                              variant="outline"
                              onClick={
                                addNewMenuRecipeLine
                              }
                              disabled={
                                state.ingredients.length === 0
                              }
                              className="border-[#ff9858]/20 bg-[#ff9858]/8 text-[#ffae78] hover:bg-[#ff9858]/12 hover:text-[#ffc39b]"
                            >
                              <Plus className="size-4" />
                              Інгредієнт
                            </Button>
                          </div>

                          <div className="space-y-2">
                            {newMenuItem.recipe.map(
                              (line) => {
                                const ingredient =
                                  state.ingredients.find(
                                    (item) =>
                                      item.id ===
                                      line.ingredientId
                                  )

                                return (
                                  <div
                                    key={line.id}
                                    className="grid grid-cols-[1fr_130px_42px] items-center gap-3 rounded-xl border border-white/8 bg-white/[0.025] p-3"
                                  >
                                    <Select
                                      value={
                                        line.ingredientId
                                      }
                                      onValueChange={(
                                        value
                                      ) =>
                                        setNewMenuItem(
                                          (current) => ({
                                            ...current,
                                            recipe:
                                              current.recipe.map(
                                                (
                                                  currentLine
                                                ) =>
                                                  currentLine.id ===
                                                  line.id
                                                    ? {
                                                        ...currentLine,
                                                        ingredientId:
                                                          value,
                                                      }
                                                    : currentLine
                                              ),
                                          })
                                        )
                                      }
                                    >
                                      <SelectTrigger className="w-full border-white/10 bg-white/5 text-white">
                                        <SelectValue />
                                      </SelectTrigger>

                                      <SelectContent className="max-h-[280px] border-white/10 bg-[#17100d] text-white">
                                        {state.ingredients.map(
                                          (
                                            currentIngredient
                                          ) => (
                                            <SelectItem
                                              key={
                                                currentIngredient.id
                                              }
                                              value={
                                                currentIngredient.id
                                              }
                                              className="text-white/75 focus:bg-white/10 focus:text-white"
                                            >
                                              {
                                                currentIngredient.name
                                              }
                                            </SelectItem>
                                          )
                                        )}
                                      </SelectContent>
                                    </Select>

                                    <div className="relative">
                                      <Input
                                        type="number"
                                        min="0"
                                        value={line.amount}
                                        onChange={(event) =>
                                          setNewMenuItem(
                                            (current) => ({
                                              ...current,
                                              recipe:
                                                current.recipe.map(
                                                  (
                                                    currentLine
                                                  ) =>
                                                    currentLine.id ===
                                                    line.id
                                                      ? {
                                                          ...currentLine,
                                                          amount:
                                                            Number(
                                                              event
                                                                .target
                                                                .value
                                                            ) ||
                                                            0,
                                                        }
                                                      : currentLine
                                                ),
                                            })
                                          )
                                        }
                                        className="border-white/10 bg-white/5 pr-10 text-white"
                                      />

                                      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-white/30">
                                        {ingredient
                                          ? ingredientUnitLabels[
                                              ingredient
                                                .baseUnit
                                            ]
                                          : ""}
                                      </span>
                                    </div>

                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() =>
                                        setNewMenuItem(
                                          (current) => ({
                                            ...current,
                                            recipe:
                                              current.recipe.filter(
                                                (
                                                  currentLine
                                                ) =>
                                                  currentLine.id !==
                                                  line.id
                                              ),
                                          })
                                        )
                                      }
                                      className="text-white/25 hover:bg-red-500/10 hover:text-red-300"
                                    >
                                      <Trash2 className="size-4" />
                                    </Button>
                                  </div>
                                )
                              }
                            )}
                          </div>
                        </div>
                      </div>

                      <DialogFooter className="mt-2 border-t border-white/10 bg-[#17100d] px-4 py-4">
                        <Button
                          variant="outline"
                          onClick={() =>
                            setMenuItemDialogOpen(false)
                          }
                          className="border-white/10 bg-white/5 text-white hover:bg-white/10 hover:text-white"
                        >
                          Скасувати
                        </Button>

                        <Button
                          onClick={addMenuItem}
                          disabled={
                            !newMenuItem.name.trim()
                          }
                          className="bg-[#ff9858] text-[#1a0e08] hover:bg-[#ffad78]"
                        >
                          <Plus className="size-4" />
                          Створити позицію
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              )
            })()}

            {section === "settings" && (
              <div className="grid gap-5 lg:grid-cols-2">
                <Card className="border-white/10 bg-[#1c1512] text-white">
                  <div className="p-5 md:p-6">
                    <div className="mb-5">
                      <div className="text-sm text-white/45">
                        Постійні витрати
                      </div>
                      <div className="mt-1 text-lg font-medium">
                        Параметри роботи точки
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <NumberField
                        label="Оренда / місяць"
                        value={state.settings.rent}
                        onChange={(value) =>
                          updateSetting("rent", value)
                        }
                      />

                      <NumberField
                        label="Робочих днів"
                        value={state.settings.workingDays}
                        onChange={(value) =>
                          updateSetting("workingDays", value)
                        }
                      />

                      <NumberField
                        label="Комунальні та інтернет"
                        value={state.settings.utilities}
                        onChange={(value) =>
                          updateSetting("utilities", value)
                        }
                      />

                      <NumberField
                        label="Маркетинг"
                        value={state.settings.marketing}
                        onChange={(value) =>
                          updateSetting("marketing", value)
                        }
                      />

                      <NumberField
                        label="Інші постійні витрати"
                        value={state.settings.otherFixedCosts}
                        onChange={(value) =>
                          updateSetting(
                            "otherFixedCosts",
                            value
                          )
                        }
                      />

                      <NumberField
                        label="Позичені кошти"
                        value={state.settings.borrowedAmount}
                        onChange={(value) =>
                          updateSetting(
                            "borrowedAmount",
                            value
                          )
                        }
                      />
                    </div>
                  </div>
                </Card>

                <Card className="border-white/10 bg-[#1c1512] text-white">
                  <div className="p-5 md:p-6">
                    <div className="mb-5">
                      <div className="text-sm text-white/45">
                        Відсотки від виручки
                      </div>
                      <div className="mt-1 text-lg font-medium">
                        Податки та комісії
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <NumberField
                        label="Еквайринг, %"
                        value={
                          state.settings.acquiringPercent
                        }
                        step={0.1}
                        onChange={(value) =>
                          updateSetting(
                            "acquiringPercent",
                            value
                          )
                        }
                      />

                      <NumberField
                        label="Податки від виручки, %"
                        value={state.settings.taxPercent}
                        step={0.1}
                        onChange={(value) =>
                          updateSetting("taxPercent", value)
                        }
                      />
                    </div>

                    <div className="mt-6 rounded-2xl border border-[#ff9858]/20 bg-[#ff9858]/8 p-4">
                      <div className="text-sm text-[#ffae78]">
                        Поточний прогноз
                      </div>
                      <div className="mt-2 text-2xl font-medium">
                        {formatMoney(financials.monthlyProfit)}
                      </div>
                      <div className="mt-1 text-sm text-white/45">
                        орієнтовного операційного прибутку на
                        місяць
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            )}
          </div>
        </main>
      </div>

      <Dialog
        open={Boolean(selectedExpense)}
        onOpenChange={(open) => {
          if (!open) setSelectedExpenseId(null)
        }}
      >
        <DialogContent className="border-white/10 bg-[#1c1512] text-white sm:max-w-[620px]">
          {selectedExpense && (() => {
            const category =
              budgetCategories[
                selectedExpense.category as BudgetCategory
              ] ?? budgetCategories["Інше"]

            const CategoryIcon = category.icon

            return (
              <>
                <DialogHeader>
                  <div className="flex items-start gap-3">
                    <div
                      className={`flex size-11 shrink-0 items-center justify-center rounded-2xl ${category.iconBox}`}
                    >
                      <CategoryIcon className="size-5" />
                    </div>

                    <div className="min-w-0">
                      <DialogTitle className="pr-8">
                        {selectedExpense.name}
                      </DialogTitle>

                      <DialogDescription className="mt-1 text-white/45">
                        Детальна інформація про витрату
                      </DialogDescription>
                    </div>
                  </div>
                </DialogHeader>

                <div className="grid gap-5 py-2">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="block">
                      <span className="text-sm text-white/60">
                        Назва
                      </span>

                      <Input
                        value={selectedExpense.name}
                        onChange={(event) =>
                          updateBudgetItem(selectedExpense.id, {
                            name: event.target.value,
                          })
                        }
                        className="mt-2 border-white/10 bg-white/5 text-white"
                      />
                    </label>

                    <label className="block">
                      <span className="text-sm text-white/60">
                        Категорія
                      </span>

                      <Select
                        value={selectedExpense.category}
                        onValueChange={(value) =>
                          updateBudgetItem(selectedExpense.id, {
                            category: value,
                          })
                        }
                      >
                        <SelectTrigger
                          className={`mt-2 w-full border ${category.badge}`}
                        >
                          <SelectValue />
                        </SelectTrigger>

                        <SelectContent>
                          {budgetCategoryNames.map((categoryName) => {
                            const meta = budgetCategories[categoryName]
                            const Icon = meta.icon

                            return (
                              <SelectItem
                                key={categoryName}
                                value={categoryName}
                              >
                                <span className="flex items-center gap-3">
                                  <Icon className="size-4" />
                                  {categoryName}
                                </span>
                              </SelectItem>
                            )
                          })}
                        </SelectContent>
                      </Select>
                    </label>
                  </div>

                  <label className="block">
                    <span className="text-sm text-white/60">
                      Опис або примітка
                    </span>

                    <textarea
                      value={selectedExpense.description ?? ""}
                      placeholder="Модель, постачальник або важливі деталі"
                      onChange={(event) =>
                        updateBudgetItem(selectedExpense.id, {
                          description: event.target.value,
                        })
                      }
                      className="mt-2 min-h-28 w-full resize-none rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none placeholder:text-white/25"
                    />
                  </label>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <div className="text-sm text-white/60">
                        Фото
                      </div>

                      {selectedExpense.imageUrl ? (
                        <div className="relative mt-2 overflow-hidden rounded-2xl border border-white/10 bg-black/20">
                          <img
                            src={selectedExpense.imageUrl}
                            alt={selectedExpense.name}
                            className="h-44 w-full object-cover"
                          />

                          <button
                            type="button"
                            onClick={() =>
                              updateBudgetItem(selectedExpense.id, {
                                imageUrl: "",
                              })
                            }
                            className="absolute right-2 top-2 flex size-8 items-center justify-center rounded-full border border-white/15 bg-black/65 text-white/75 backdrop-blur hover:bg-red-500/70 hover:text-white"
                            aria-label="Видалити фото"
                          >
                            <X className="size-4" />
                          </button>
                        </div>
                      ) : (
                        <label className="mt-2 flex h-44 cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-white/15 bg-white/[0.025] text-center transition hover:border-[#ff9858]/40 hover:bg-[#ff9858]/5">
                          <ImagePlus className="size-6 text-[#ffae78]" />

                          <span className="mt-3 text-sm text-white/65">
                            Додати фото
                          </span>

                          <span className="mt-1 text-xs text-white/30">
                            JPG, PNG або WEBP
                          </span>

                          <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            className="hidden"
                            onChange={(event) => {
                              const file = event.target.files?.[0]

                              if (file) {
                                readImageFile(file, (imageUrl) =>
                                  updateBudgetItem(
                                    selectedExpense.id,
                                    { imageUrl }
                                  )
                                )
                              }

                              event.target.value = ""
                            }}
                          />
                        </label>
                      )}

                      {selectedExpense.imageUrl && (
                        <label className="mt-2 inline-flex cursor-pointer items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/65 hover:bg-white/10">
                          <ImagePlus className="size-4" />
                          Замінити фото

                          <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            className="hidden"
                            onChange={(event) => {
                              const file = event.target.files?.[0]

                              if (file) {
                                readImageFile(file, (imageUrl) =>
                                  updateBudgetItem(
                                    selectedExpense.id,
                                    { imageUrl }
                                  )
                                )
                              }

                              event.target.value = ""
                            }}
                          />
                        </label>
                      )}
                    </div>

                    <div>
                      <label className="block">
                        <span className="text-sm text-white/60">
                          Посилання
                        </span>

                        <div className="relative mt-2">
                          <Link2 className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-white/30" />

                          <Input
                            type="url"
                            value={selectedExpense.linkUrl ?? ""}
                            placeholder="https://..."
                            onChange={(event) =>
                              updateBudgetItem(selectedExpense.id, {
                                linkUrl: event.target.value,
                              })
                            }
                            className="border-white/10 bg-white/5 pl-10 text-white"
                          />
                        </div>
                      </label>

                      {selectedExpense.linkUrl?.trim() && (
                        <a
                          href={
                            selectedExpense.linkUrl.startsWith("http")
                              ? selectedExpense.linkUrl
                              : `https://${selectedExpense.linkUrl}`
                          }
                          target="_blank"
                          rel="noreferrer"
                          className="mt-3 flex items-center justify-between rounded-xl border border-[#ff9858]/20 bg-[#ff9858]/8 px-4 py-3 text-sm text-[#ffae78] transition hover:bg-[#ff9858]/12"
                        >
                          <span className="truncate pr-3">
                            Відкрити посилання
                          </span>

                          <ExternalLink className="size-4 shrink-0" />
                        </a>
                      )}

                      <div className="mt-4 rounded-xl border border-white/8 bg-white/[0.025] p-3 text-xs leading-relaxed text-white/35">
                        Тут можна зберегти посилання на товар,
                        кошторис, постачальника або оголошення.
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-3">
                    <label className="block">
                      <span className="text-sm text-white/60">
                        Кількість
                      </span>

                      <Input
                        type="number"
                        min="0"
                        value={selectedExpense.quantity}
                        onChange={(event) =>
                          updateBudgetItem(selectedExpense.id, {
                            quantity:
                              Number(event.target.value) || 0,
                          })
                        }
                        className="mt-2 border-white/10 bg-white/5 text-white"
                      />
                    </label>

                    <label className="block">
                      <span className="text-sm text-white/60">
                        Ціна за одиницю
                      </span>

                      <Input
                        type="number"
                        min="0"
                        value={selectedExpense.unitPrice}
                        onChange={(event) =>
                          updateBudgetItem(selectedExpense.id, {
                            unitPrice:
                              Number(event.target.value) || 0,
                          })
                        }
                        className="mt-2 border-white/10 bg-white/5 text-white"
                      />
                    </label>

                    <label className="block">
                      <span className="text-sm text-white/60">
                        Статус
                      </span>

                      <Select
                        value={selectedExpense.status}
                        onValueChange={(value) =>
                          updateBudgetItem(selectedExpense.id, {
                            status:
                              value as BudgetItem["status"],
                          })
                        }
                      >
                        <SelectTrigger
                          className={`mt-2 w-full border ${
                            budgetStatusMeta[
                              selectedExpense.status
                            ].className
                          }`}
                        >
                          <SelectValue>
                            {
                              budgetStatusMeta[
                                selectedExpense.status
                              ].label
                            }
                          </SelectValue>
                        </SelectTrigger>

                        <SelectContent className="min-w-[190px] rounded-2xl border-white/10 bg-[#17100d] p-1.5 text-white shadow-[0_18px_60px_rgba(0,0,0,0.55)]">
                          {(
                            Object.entries(
                              budgetStatusMeta
                            ) as [
                              BudgetItem["status"],
                              (typeof budgetStatusMeta)[BudgetItem["status"]]
                            ][]
                          ).map(([status, meta]) => (
                            <SelectItem
                                      key={status}
                                      value={status}
                                      className="my-0.5 rounded-xl py-2.5 pl-3 pr-9 text-white/80 outline-none transition
        focus:bg-[#f4e1d2] focus:text-[#1a0e08]
        data-[highlighted]:bg-[#f4e1d2] data-[highlighted]:text-[#1a0e08]
        data-[state=checked]:bg-[#ffeddc] data-[state=checked]:text-[#1a0e08]"
                                    >
                                      <span className="flex items-center gap-3">
                                        <span
                                          className={`size-2.5 rounded-full ${
                                            status === "planned"
                                              ? "bg-white/45 ring-4 ring-white/5"
                                              : status === "quoted"
                                                ? "bg-sky-400 ring-4 ring-sky-400/10"
                                                : status === "ordered"
                                                  ? "bg-orange-400 ring-4 ring-orange-400/10"
                                                  : "bg-emerald-400 ring-4 ring-emerald-400/10"
                                          }`}
                                        />
                                        {meta.label}
                                      </span>
                                    </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </label>
                  </div>

                  <div className="flex items-center justify-between rounded-xl border border-[#ff9858]/20 bg-[#ff9858]/8 px-4 py-3">
                    <span className="text-sm text-white/55">
                      Загальна сума
                    </span>

                    <span className="text-lg font-medium text-[#ffae78]">
                      {formatMoney(
                        selectedExpense.quantity *
                          selectedExpense.unitPrice
                      )}
                    </span>
                  </div>
                </div>

                <DialogFooter className="mt-2 flex rounded-b-2xl border-t border-white/10 bg-[#17100d] px-4 py-4 sm:justify-between">
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setState((current) => ({
                        ...current,
                        budget: current.budget.filter(
                          (item) => item.id !== selectedExpense.id
                        ),
                      }))
                      setSelectedExpenseId(null)
                    }}
                    className="border border-red-400/15 bg-red-400/[0.06] text-red-300 hover:bg-red-400/10 hover:text-red-200"
                  >
                    <Trash2 className="size-4" />
                    Видалити
                  </Button>

                  <Button
                    onClick={() => setSelectedExpenseId(null)}
                    className="bg-[#ff9858] font-medium text-[#1a0e08] hover:bg-[#ffad78]"
                  >
                    Готово
                  </Button>
                </DialogFooter>
              </>
            )
          })()}
        </DialogContent>
      </Dialog>

      <Dialog
        open={expenseDialogOpen}
        onOpenChange={setExpenseDialogOpen}
      >
        <DialogContent className="border-white/10 bg-[#1c1512] text-white sm:max-w-[560px]">
          <DialogHeader>
            <DialogTitle>Додати нову витрату</DialogTitle>
            <DialogDescription className="text-white/45">
              Заповни основні параметри. Сума одразу потрапить
              у загальний бюджет запуску.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-5 py-2">
            <label className="block">
              <span className="text-sm text-white/60">
                Назва витрати
              </span>

              <Input
                autoFocus
                value={newExpense.name}
                placeholder="Наприклад: фільтр для води"
                onChange={(event) =>
                  setNewExpense((current) => ({
                    ...current,
                    name: event.target.value,
                  }))
                }
                className="mt-2 border-white/10 bg-white/5 text-white"
              />
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="text-sm text-white/60">
                  Категорія
                </span>

                <Select
                  value={newExpense.category}
                  onValueChange={(value) =>
                    setNewExpense((current) => ({
                      ...current,
                      category: value as BudgetCategory,
                    }))
                  }
                >
                  <SelectTrigger className="mt-2 w-full border-white/10 bg-white/5 text-white">
                    <SelectValue />
                  </SelectTrigger>

                  <SelectContent>
                    {budgetCategoryNames.map((categoryName) => {
                      const meta = budgetCategories[categoryName]
                      const Icon = meta.icon

                      return (
                        <SelectItem
                          key={categoryName}
                          value={categoryName}
                        >
                          <span className="flex items-center gap-3">
                            <Icon className="size-4" />
                            {categoryName}
                          </span>
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>
              </label>

              <div className="rounded-xl border border-white/10 bg-white/[0.025] p-3">
                <div className="text-xs text-white/40">
                  Іконка категорії
                </div>

                <div className="mt-3 flex items-center gap-3">
                  {(() => {
                    const meta =
                      budgetCategories[newExpense.category]
                    const Icon = meta.icon

                    return (
                      <>
                        <div
                          className={`flex size-10 items-center justify-center rounded-xl ${meta.iconBox}`}
                        >
                          <Icon className="size-4" />
                        </div>

                        <span
                          className={`rounded-full border px-3 py-1 text-xs ${meta.badge}`}
                        >
                          {newExpense.category}
                        </span>
                      </>
                    )
                  })()}
                </div>
              </div>
            </div>

            <label className="block">
              <span className="text-sm text-white/60">
                Опис або примітка
              </span>

              <textarea
                value={newExpense.description}
                placeholder="Модель, постачальник або важливі деталі"
                onChange={(event) =>
                  setNewExpense((current) => ({
                    ...current,
                    description: event.target.value,
                  }))
                }
                className="mt-2 min-h-24 w-full resize-none rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none placeholder:text-white/25"
              />
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <div className="text-sm text-white/60">
                  Фото
                </div>

                {newExpense.imageUrl ? (
                  <div className="relative mt-2 overflow-hidden rounded-2xl border border-white/10">
                    <img
                      src={newExpense.imageUrl}
                      alt="Нова витрата"
                      className="h-36 w-full object-cover"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setNewExpense((current) => ({
                          ...current,
                          imageUrl: "",
                        }))
                      }
                      className="absolute right-2 top-2 flex size-8 items-center justify-center rounded-full bg-black/65 text-white"
                      aria-label="Видалити фото"
                    >
                      <X className="size-4" />
                    </button>
                  </div>
                ) : (
                  <label className="mt-2 flex h-36 cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-white/15 bg-white/[0.025] hover:border-[#ff9858]/40">
                    <ImagePlus className="size-5 text-[#ffae78]" />
                    <span className="mt-2 text-sm text-white/60">
                      Додати фото
                    </span>

                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                      onChange={(event) => {
                        const file = event.target.files?.[0]

                        if (file) {
                          readImageFile(file, (imageUrl) =>
                            setNewExpense((current) => ({
                              ...current,
                              imageUrl,
                            }))
                          )
                        }

                        event.target.value = ""
                      }}
                    />
                  </label>
                )}
              </div>

              <label className="block">
                <span className="text-sm text-white/60">
                  Посилання
                </span>

                <div className="relative mt-2">
                  <Link2 className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-white/30" />

                  <Input
                    type="url"
                    value={newExpense.linkUrl}
                    placeholder="https://..."
                    onChange={(event) =>
                      setNewExpense((current) => ({
                        ...current,
                        linkUrl: event.target.value,
                      }))
                    }
                    className="border-white/10 bg-white/5 pl-10 text-white"
                  />
                </div>
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="text-sm text-white/60">
                  Кількість
                </span>

                <Input
                  type="number"
                  min="1"
                  value={newExpense.quantity}
                  onChange={(event) =>
                    setNewExpense((current) => ({
                      ...current,
                      quantity:
                        Number(event.target.value) || 1,
                    }))
                  }
                  className="mt-2 border-white/10 bg-white/5 text-white"
                />
              </label>

              <label className="block">
                <span className="text-sm text-white/60">
                  Ціна за одиницю
                </span>

                <Input
                  type="number"
                  min="0"
                  value={newExpense.unitPrice}
                  onChange={(event) =>
                    setNewExpense((current) => ({
                      ...current,
                      unitPrice:
                        Number(event.target.value) || 0,
                    }))
                  }
                  className="mt-2 border-white/10 bg-white/5 text-white"
                />
              </label>
            </div>

            <div className="flex items-center justify-between rounded-xl border border-[#ff9858]/20 bg-[#ff9858]/8 px-4 py-3">
              <span className="text-sm text-white/55">
                Загальна сума
              </span>

              <span className="text-lg font-medium text-[#ffae78]">
                {formatMoney(
                  newExpense.quantity * newExpense.unitPrice
                )}
              </span>
            </div>
          </div>

          <DialogFooter className="mt-2 rounded-b-2xl border-t border-white/10 bg-[#17100d] px-4 py-4">
            <Button
              variant="outline"
              onClick={() => setExpenseDialogOpen(false)}
              className="border-white/10 bg-white/5 text-white hover:bg-white/10 hover:text-white"
            >
              Скасувати
            </Button>

            <Button
              onClick={addBudgetItem}
              disabled={!newExpense.name.trim()}
              className="bg-[#ff9858] font-medium text-[#1a0e08] hover:bg-[#ffad78]"
            >
              <Plus className="size-4" />
              Додати витрату
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function MetricCard({
  label,
  value,
  detail,
  icon: Icon,
  warning = false,
  tone = "orange",
}: {
  label: string
  value: string
  detail: string
  icon: typeof PackageSearch
  warning?: boolean
  tone?: "orange" | "amber" | "emerald" | "sky"
}) {
  const toneStyles = {
    orange: {
      border:
        "border-[#ff9858]/35",
      bg:
        "bg-gradient-to-br from-[#2b1913] via-[#1f1411] to-[#17100d]",
      glow:
        "bg-[#ff9858]/16",
      topLine:
        "bg-gradient-to-r from-transparent via-[#ff9858] to-transparent",
      icon:
        "border-[#ff9858]/30 bg-[#ff9858]/14 text-[#ffb27f]",
      shadow:
        "shadow-[0_14px_44px_rgba(255,152,88,0.12)]",
      hover:
        "hover:shadow-[0_20px_60px_rgba(255,152,88,0.18)]",
    },
    amber: {
      border:
        "border-[#ffc76e]/35",
      bg:
        "bg-gradient-to-br from-[#2c2112] via-[#1f1710] to-[#17110c]",
      glow:
        "bg-[#ffc76e]/14",
      topLine:
        "bg-gradient-to-r from-transparent via-[#ffc76e] to-transparent",
      icon:
        "border-[#ffc76e]/30 bg-[#ffc76e]/14 text-[#ffd796]",
      shadow:
        "shadow-[0_14px_44px_rgba(255,199,110,0.12)]",
      hover:
        "hover:shadow-[0_20px_60px_rgba(255,199,110,0.18)]",
    },
    emerald: {
      border:
        "border-emerald-400/30",
      bg:
        "bg-gradient-to-br from-[#15211c] via-[#121916] to-[#0f1412]",
      glow:
        "bg-emerald-400/12",
      topLine:
        "bg-gradient-to-r from-transparent via-emerald-400 to-transparent",
      icon:
        "border-emerald-400/25 bg-emerald-400/12 text-emerald-300",
      shadow:
        "shadow-[0_14px_44px_rgba(52,211,153,0.10)]",
      hover:
        "hover:shadow-[0_20px_60px_rgba(52,211,153,0.16)]",
    },
    sky: {
      border:
        "border-sky-400/30",
      bg:
        "bg-gradient-to-br from-[#15202a] via-[#121821] to-[#10151c]",
      glow:
        "bg-sky-400/12",
      topLine:
        "bg-gradient-to-r from-transparent via-sky-400 to-transparent",
      icon:
        "border-sky-400/25 bg-sky-400/12 text-sky-300",
      shadow:
        "shadow-[0_14px_44px_rgba(56,189,248,0.10)]",
      hover:
        "hover:shadow-[0_20px_60px_rgba(56,189,248,0.16)]",
    },
  } as const

  const currentTone = warning
    ? {
        border: "border-red-400/30",
        bg: "bg-gradient-to-br from-[#2a1717] via-[#1c1313] to-[#140f0f]",
        glow: "bg-red-400/12",
        topLine:
          "bg-gradient-to-r from-transparent via-red-400 to-transparent",
        icon:
          "border-red-400/25 bg-red-400/12 text-red-300",
        shadow:
          "shadow-[0_14px_44px_rgba(248,113,113,0.10)]",
        hover:
          "hover:shadow-[0_20px_60px_rgba(248,113,113,0.16)]",
      }
    : toneStyles[tone]

  return (
    <Card
      className={`group relative overflow-hidden border transition-all duration-300 ${currentTone.border} ${currentTone.bg} ${currentTone.shadow} ${currentTone.hover} hover:-translate-y-0.5`}
    >
      <div
        className={`absolute inset-x-0 top-0 h-[2px] ${currentTone.topLine}`}
      />

      <div
        className={`absolute -right-10 -top-10 size-28 rounded-full blur-3xl ${currentTone.glow}`}
      />

      <div className="relative p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="text-sm font-medium text-white/60">
            {label}
          </div>

          <div
            className={`flex size-10 items-center justify-center rounded-2xl border ${currentTone.icon}`}
          >
            <Icon className="size-4" />
          </div>
        </div>

        <div className="mt-6 text-3xl font-semibold tracking-tight text-white md:text-4xl">
          {value}
        </div>

        <div className="mt-2 text-sm text-white/45">
          {detail}
        </div>
      </div>
    </Card>
  )
}

function MiniStat({
  label,
  value,
  accent = false,
}: {
  label: string
  value: string
  accent?: boolean
}) {
  return (
    <div className="rounded-xl border border-white/8 bg-white/[0.025] p-3">
      <div className="text-xs text-white/40">{label}</div>
      <div
        className={`mt-1 text-sm font-medium ${
          accent ? "text-[#ffae78]" : ""
        }`}
      >
        {value}
      </div>
    </div>
  )
}

function DataRow({
  label,
  value,
  accent = false,
}: {
  label: string
  value: string
  accent?: boolean
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-white/8 pb-4 last:border-0 last:pb-0">
      <span className="text-sm text-white/50">{label}</span>
      <span
        className={`text-sm font-medium ${
          accent ? "text-[#ffae78]" : ""
        }`}
      >
        {value}
      </span>
    </div>
  )
}

function MenuValue({
  label,
  value,
  tone = "default",
}: {
  label: string
  value: string
  tone?: "default" | "good" | "warning" | "danger"
}) {
  const toneClass = {
    default: "text-white",
    good: "text-emerald-300",
    warning: "text-amber-300",
    danger: "text-red-300",
  }[tone]

  return (
    <div className="min-w-0 rounded-xl border border-white/8 bg-black/10 px-4 py-3.5">
      <div className="truncate text-[11px] uppercase tracking-wide text-white/30">
        {label}
      </div>

      <div
        className={`mt-1.5 truncate text-base font-medium ${toneClass}`}
      >
        {value}
      </div>
    </div>
  )
}

function MenuSummary({
  label,
  value,
  tone = "default",
}: {
  label: string
  value: string
  tone?: "default" | "good" | "warning" | "danger"
}) {
  const toneClass = {
    default: "text-white",
    good: "text-emerald-300",
    warning: "text-amber-300",
    danger: "text-red-300",
  }[tone]

  return (
    <div className="rounded-2xl border border-white/8 bg-white/[0.025] p-4">
      <div className="text-xs text-white/35">{label}</div>

      <div className={`mt-2 font-medium ${toneClass}`}>
        {value}
      </div>
    </div>
  )
}

function NumberField({
  label,
  value,
  onChange,
  step = 1,
}: {
  label: string
  value: number
  step?: number
  onChange: (value: number) => void
}) {
  return (
    <label className="block">
      <span className="text-sm text-white/55">{label}</span>
      <Input
        type="number"
        min="0"
        step={step}
        value={value}
        onChange={(event) =>
          onChange(Number(event.target.value) || 0)
        }
        className="mt-2 border-white/10 bg-white/5 text-white"
      />
    </label>
  )
}
