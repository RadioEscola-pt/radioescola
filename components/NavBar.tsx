"use client";
import Link from "next/link";
import { Home, BookOpen, FileText, Radio, Info, Calculator, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCalculators } from "@components/providers/CalculatorProvider";

const categories = [
  { id: "3", title: "Categoria 3", description: "Entrada" },
  { id: "2", title: "Categoria 2", description: "Intermedio" },
  { id: "1", title: "Categoria 1", description: "Avancado" },
] as const;

const exams = categories.map((cat) => ({
  title: cat.title,
  href: `/exam/${cat.id}`,
  description: cat.description,
}));

const browse: { title: string; href: string; description: string }[] = categories.flatMap((cat) => [
  {
    title: `${cat.title}`,
    href: `/browse/${cat.id}`,
    description: `${cat.description} - completo`,
  },
  {
    title: `${cat.title}`,
    href: `/browse/${cat.id}/flash`,
    description: `${cat.description} - flashcards`,
  },
]);

const calculators = [
  {
    title: "Ohm's Law",
    description: "Solve voltage, current, or resistance.",
    action: "ohm",
  },
] as const;

export default function NavBar() {
  const { openOhms } = useCalculators();

  return (
    <header className="sticky top-0 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg">
          <Radio className="h-6 w-6" />
          HamRadioStudy
        </Link>
        <nav className="flex items-center gap-1">
          <Link
            href="/"
            className="inline-flex h-9 items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none"
          >
            <Home className="mr-2 h-4 w-4" />
            Home
          </Link>

          <Link
            href="/study"
            className="inline-flex h-9 items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none"
          >
            <BookOpen className="mr-2 h-4 w-4" />
            Study
          </Link>

          <DropdownMenu>
            <DropdownMenuTrigger className="inline-flex h-9 items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none data-[state=open]:bg-accent">
              <BookOpen className="mr-2 h-4 w-4" />
              Browse
              <ChevronDown className="ml-1 h-3 w-3 transition-transform duration-200 group-data-[state=open]:rotate-180" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-[220px]">
              {browse.map((item) => (
                <DropdownMenuItem key={item.href} asChild>
                  <Link href={item.href} className="cursor-pointer">
                    <div className="flex flex-col">
                      <span className="font-medium">{item.title}</span>
                      <span className="text-xs text-muted-foreground">{item.description}</span>
                    </div>
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger className="inline-flex h-9 items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none data-[state=open]:bg-accent">
              <FileText className="mr-2 h-4 w-4" />
              Exam
              <ChevronDown className="ml-1 h-3 w-3 transition-transform duration-200 group-data-[state=open]:rotate-180" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-[200px]">
              {exams.map((exam) => (
                <DropdownMenuItem key={exam.href} asChild>
                  <Link href={exam.href} className="cursor-pointer">
                    <div className="flex flex-col">
                      <span className="font-medium">{exam.title}</span>
                      <span className="text-xs text-muted-foreground">{exam.description}</span>
                    </div>
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger className="inline-flex h-9 items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none data-[state=open]:bg-accent">
              <Calculator className="mr-2 h-4 w-4" />
              Calculators
              <ChevronDown className="ml-1 h-3 w-3 transition-transform duration-200 group-data-[state=open]:rotate-180" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-[220px]">
              {calculators.map((calc) => (
                <DropdownMenuItem
                  key={calc.action}
                  className="cursor-pointer"
                  onClick={() => {
                    if (calc.action === "ohm") {
                      openOhms();
                    }
                  }}
                >
                  <div className="flex flex-col">
                    <span className="font-medium">{calc.title}</span>
                    <span className="text-xs text-muted-foreground">{calc.description}</span>
                  </div>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Link
            href="/about"
            className="inline-flex h-9 items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none"
          >
            <Info className="mr-2 h-4 w-4" />
            About
          </Link>
        </nav>
      </div>
    </header>
  );
}

