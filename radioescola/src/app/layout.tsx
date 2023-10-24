import ListItem from '@/components/ListItem'
import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Link from 'next/link'
import AuthSessionProvider from '@/components/AuthSessionProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'RadioEscola',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {

  return (
    <AuthSessionProvider>
    <html lang="en">

      <body className="bg-slate-50 dark:bg-slate-800 dark:text-white">
    <header
      className="flex justify-center font-header h-[25vh] bg-header bg-center bg-cover"
    >
      <div
        className="w-full h-full flex justify-center items-center bg-[rgba(0,0,0,0.3)] backdrop-blur-sm"
      >
        <Link
          href="/"
          className="self-center font-header text-[#ff9a17] text-2xl md:text-5xl drop-shadow-[0px_2px_0px_#b26b10]"
          >Rádio Escola</Link>
      </div>
    </header>
    <nav
      className="bg-slate-100 border-gray-200 dark:bg-gray-900 dark:border-gray-700"
    >
      <div
        className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4"
      >
        <span></span>
        <button
          data-collapse-toggle="navbar-multi-level"
          type="button"
          className="inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-gray-500 rounded-lg md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600"
          aria-controls="navbar-multi-level"
          aria-expanded="false"
        >
          <span className="sr-only">Open main menu</span>
          <img src="images/menu.svg" className="w-5 h-5" alt="menu" />
        </button>
        <div className="hidden w-full md:block md:w-auto" id="navbar-multi-level">
          <ul
            className="flex flex-col font-medium p-4 md:p-0 mt-4 border border-gray-100 rounded-lg md:flex-row md:space-x-8 md:mt-0 md:border-0 dark:bg-gray-800 md:dark:bg-gray-900 dark:border-gray-700"
          >
            <li>
              <Link
                
                href="/"
                className="block py-2 pl-3 pr-4 text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-blue-700 md:p-0 dark:text-white md:dark:hover:text-blue-500 dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent"
                aria-current="page"
                >Início</Link
              >
            </li>
            <li>
              <Link
                
                href="/equipa"
                className="block py-2 pl-3 pr-4 text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-blue-700 md:p-0 dark:text-white md:dark:hover:text-blue-500 dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent"
                aria-current="page"
                >Equipa</Link>
            </li>
            <li>
              <Link
                
                href="/edn"
                className="block py-2 pl-3 pr-4 text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-blue-700 md:p-0 dark:text-white md:dark:hover:text-blue-500 dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent"
                aria-current="page"
                >Estado da Nação</Link>
            </li>
            <li>
              <button
                id="examsDropdownLink"
                data-dropdown-toggle="examsDropdown"
                className="flex items-center justify-between w-full py-2 pl-3 pr-4 text-gray-700 border-b border-gray-100 hover:bg-gray-50 md:hover:bg-transparent md:border-0 md:hover:text-blue-700 md:p-0 md:w-auto dark:text-white md:dark:hover:text-blue-500 dark:focus:text-white dark:border-gray-700 dark:hover:bg-gray-700 md:dark:hover:bg-transparent"
              >
                Exames
                <img alt="" src="images/arrow-down.svg" className="w-2.5 h-2.5 ml-2.5" />
              </button>
              <div
                id="examsDropdown"
                className="z-10 hidden font-normal bg-white divide-y divide-gray-100 rounded-lg shadow w-44 dark:bg-gray-700 dark:divide-gray-600"
              >
                <ul
                  className="py-2 text-sm text-gray-700 dark:text-gray-400"
                  aria-labelledby="dropdownLargeButton"
                >
                  <li aria-labelledby="examsDropdownLink">
                    <button
                      id="cat3examsButton"
                      data-dropdown-toggle="cat3exams"
                      data-dropdown-placement="right-start"
                      type="button"
                      className="flex items-center justify-between w-full px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                    >
                      Categoria 3
                      <img alt=""
                        src="images/arrow-down.svg"
                        className="w-2.5 h-2.5 ml-2.5"
                      />
                    </button>
                    <div
                      id="cat3exams"
                      className="z-10 hidden bg-white divide-y divide-gray-100 rounded-lg shadow w-44 dark:bg-gray-700"
                    >
                      <ul
                        className="py-2 text-sm text-gray-700 dark:text-gray-200"
                        aria-labelledby="cat3examsButton"
                      >
                        <ListItem name='Favoritas' page='/fav/3'/>
                        <ListItem name='Todas as perguntas' page='/all/3'/>
                        <ListItem name='Simulador de exame' page='/quiz/3'/>
                      </ul>
                    </div>
                  </li>
                  <li aria-labelledby="examsDropdownLink">
                    <button
                      id="cat2examsButton"
                      data-dropdown-toggle="cat2exams"
                      data-dropdown-placement="right-start"
                      type="button"
                      className="flex items-center justify-between w-full px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                    >
                      Categoria 2
                      <img alt=""
                        src="images/arrow-down.svg"
                        className="w-2.5 h-2.5 ml-2.5"
                      />
                    </button>
                    <div
                      id="cat2exams"
                      className="z-10 hidden bg-white divide-y divide-gray-100 rounded-lg shadow w-44 dark:bg-gray-700"
                    >
                      <ul
                        className="py-2 text-sm text-gray-700 dark:text-gray-200"
                        aria-labelledby="cat2examsButton"
                      >
                        <ListItem name='Favoritas' page='/fav/2'/>
                        <ListItem name='Todas as perguntas' page='/all/2'/>
                        <ListItem name='Simulador de exame' page='/quiz/2'/>
                      </ul>
                    </div>
                  </li>
                  <li aria-labelledby="examsDropdownLink">
                    <button
                      id="cat1examsButton"
                      data-dropdown-toggle="cat1exams"
                      data-dropdown-placement="right-start"
                      type="button"
                      className="flex items-center justify-between w-full px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                    >
                      Categoria 1
                      <img alt=""
                        src="images/arrow-down.svg"
                        className="w-2.5 h-2.5 ml-2.5"
                      />
                    </button>
                    <div
                      id="cat1exams"
                      className="z-10 hidden bg-white divide-y divide-gray-100 rounded-lg shadow w-44 dark:bg-gray-700"
                    >
                      <ul
                        className="py-2 text-sm text-gray-700 dark:text-gray-200"
                        aria-labelledby="cat1examsButton"
                      >
                        <ListItem name='Favoritas' page='/fav/1'/>
                        <ListItem name='Todas as perguntas' page='/all/1'/>
                        <ListItem name='Simulador de exame' page='/quiz/1'/>
                      </ul>
                    </div>
                  </li>
                  <ListItem name='Ir a exame' page='/tutorial/exame'/>

                </ul>
              </div>
            </li>
            <li>
              <button
                id="studyLink"
                data-dropdown-toggle="studyNavbar"
                className="flex items-center justify-between w-full py-2 pl-3 pr-4 text-gray-700 border-b border-gray-100 hover:bg-gray-50 md:hover:bg-transparent md:border-0 md:hover:text-blue-700 md:p-0 md:w-auto dark:text-white md:dark:hover:text-blue-500 dark:focus:text-white dark:border-gray-700 dark:hover:bg-gray-700 md:dark:hover:bg-transparent"
              >
                Estudo
                <img alt="" src="images/arrow-down.svg" className="w-2.5 h-2.5 ml-2.5" />
              </button>
              <div
                id="studyNavbar"
                className="z-10 hidden font-normal bg-white divide-y divide-gray-100 rounded-lg shadow w-44 dark:bg-gray-700 dark:divide-gray-600"
              >
                <ul
                  className="py-2 text-sm text-gray-700 dark:text-gray-400"
                  aria-labelledby="dropdownLargeButton"
                >
                  <li aria-labelledby="studyLink">
                    <button
                      id="study3Button"
                      data-dropdown-toggle="study3Dropdown"
                      data-dropdown-placement="right-start"
                      type="button"
                      className="flex items-center justify-between w-full px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                    >
                      Categoria 3
                      <img alt=""
                        src="images/arrow-down.svg"
                        className="w-2.5 h-2.5 ml-2.5"
                      />
                    </button>
                    <div
                      id="study3Dropdown"
                      className="z-10 hidden bg-white divide-y divide-gray-100 rounded-lg shadow w-44 dark:bg-gray-700"
                    >
                      <ul
                        className="py-2 text-sm text-gray-700 dark:text-gray-200"
                        aria-labelledby="study3Button"
                      >
                        <ListItem name='Alfabeto Fonético' page='/tutorial/alfabeto'/>
                        <ListItem name='Entidades e Competências' page='/tutorial/entidades'/>
                        <ListItem name='(...)'/>
                      </ul>
                    </div>
                  </li>
                  <li aria-labelledby="dropdownNavbarLink">
                    <button
                      id="study2Button"
                      data-dropdown-toggle="study2Dropdown"
                      data-dropdown-placement="right-start"
                      type="button"
                      className="flex items-center justify-between w-full px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                    >
                      Categoria 2
                      <img alt=""
                        src="images/arrow-down.svg"
                        className="w-2.5 h-2.5 ml-2.5"
                      />
                    </button>
                    <div
                      id="study2Dropdown"
                      className="z-10 hidden bg-white divide-y divide-gray-100 rounded-lg shadow w-44 dark:bg-gray-700"
                    >
                      <ul
                        className="py-2 text-sm text-gray-700 dark:text-gray-200"
                        aria-labelledby="study2Button"
                      >
                        <ListItem name='Onda Estacionaria (SWR)' page='/tutorial/swr'/>

                        
                      </ul>
                    </div>
                  </li>
                  <li aria-labelledby="dropdownNavbarLink">
                    <button
                      id="study1Button"
                      data-dropdown-toggle="study1Dropdown"
                      data-dropdown-placement="right-start"
                      type="button"
                      className="flex items-center justify-between w-full px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                    >
                      Categoria 1
                      <img alt=""
                        src="images/arrow-down.svg"
                        className="w-2.5 h-2.5 ml-2.5"
                      />
                    </button>
                    <div
                      id="study1Dropdown"
                      className="z-10 hidden bg-white divide-y divide-gray-100 rounded-lg shadow w-44 dark:bg-gray-700"
                    >
                      <ul
                        className="py-2 text-sm text-gray-700 dark:text-gray-200"
                        aria-labelledby="study1Button"
                      >
                        <ListItem name='Ganho (dB)' page='/tutorial/ganho'/>

                        <ListItem name='Transformadores' page='/tutorial/transformadores'/>

                        <ListItem name='(...)'/>

                      </ul>
                    </div>
                  </li>
                </ul>
              </div>
            </li>
            <li id="theme-toggle" className="flex">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z"
                />
              </svg>
            </li>
          </ul>
        </div>
      </div>
    </nav>

    <section>

      <article
        id="welcome"
        className="max-w-screen-xl m-auto mt-12 mb-12 p-5 xl:p-0"
      >
        {children}
      </article>
    </section>

    <footer className="bg-gray-800 dark:bg-gray-900 p-10 text-center text-white">
      <div className="max-w-screen-xl m-auto grid grid-cols-2 items-center">
        <div className="flex gap-1 flex-col items-start text-sm">
          <a
            href="https://github.com/RadioEscola-pt/radioescola/issues"
            target="_blank"
            className="text-white"
            >Reportar problemas / erros / sugestões</a>
          <a
            href="https://github.com/RadioEscola-pt/radioescola/discussions"
            target="_blank"
            className="text-white"
            >Fórum</a>
          <a
            href="https://github.com/RadioEscola-pt/radioescola/issues"
            target="_blank"
            className="text-white"
            >Código</a>
          <a href="#" id="ShowPrivacyBar">Politica de Privacidade</a>
        </div>

        <div className="flex flex-col items-end">
          <div className="flex flex-row items-center">
            <a href="https://t.me/+xQNzwNwb2JIxMWY8">
              <img src="images/telegram.svg" alt="Telegram" className="h-8"
            /></a>
            <a
              href="https://play.google.com/store/apps/details?id=com.andradator.escoladeradioamador"
            >
              <img
                src="https://play.google.com/intl/en_us/badges/static/images/badges/en_badge_web_generic.png"
                alt="Get it on Google Play"
                className="h-12"
              />
            </a>
          </div>
          <span className="text-xs"
            >Feito por radioamadores, para (futuros) radioamadores</span>
        </div>
      </div>
    </footer>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/flowbite/1.8.1/flowbite.min.js"></script>
  </body>
    </html>
    </AuthSessionProvider>
  )
}
