export type Lesson = {
  goal: string;
  explain: string[];
  example: string;
  tryIt: string;
  answer: string;
  why: string;
  terms: [string, string][];
  demo: "grid" | "formula" | "steps" | "sheets";
  steps?: string[];
};
export const lessons: Record<string, Lesson> = {
  spreadsheet: {
    goal: "Understand why spreadsheets turn lists into useful information.",
    explain: [
      "A spreadsheet is an electronic table used to store, organise, calculate and analyse data. Rows run across the screen and columns run down it. Their intersections form cells.",
      "A paper expense table can show what you spent. An electronic spreadsheet can also calculate totals and update them automatically when a value changes. This makes it useful for marksheets, budgets, stock records and comparisons.",
      "Microsoft Excel is a spreadsheet application. A workbook is its file, while worksheets are the individual grids inside that file.",
    ],
    example:
      "A class marksheet stores names as text, marks as numbers, and totals as formulas.",
    tryIt:
      "Which is the best tool for automatically recalculating a family budget?",
    answer: "A spreadsheet",
    why: "A spreadsheet connects values to formulas, so totals update when expenses change.",
    terms: [
      [
        "Spreadsheet",
        "An electronic table for organising, calculating and analysing data.",
      ],
      ["Cell", "The intersection of one row and one column."],
    ],
    demo: "grid",
  },
  features: {
    goal: "Choose the right spreadsheet feature for a task.",
    explain: [
      "A formula is an expression you write, such as =B3+C3. A function is a built-in calculation used in a formula, such as =SUM(B3:G3). Automatic recalculation updates both when referenced values change.",
      "Formatting changes how data looks: bold headings, number formats, colours and alignment help people read a worksheet. Formatting usually changes appearance rather than the underlying value.",
      "Find locates data. Replace substitutes it. Auto Fill copies values or extends a pattern, such as Monday, Tuesday, Wednesday. Charts turn data into visual comparisons.",
    ],
    example:
      "Type 2 and 4 in neighbouring cells. Selecting both and using Auto Fill can continue 6, 8, 10.",
    tryIt: "Which feature extends Monday, Tuesday into the remaining weekdays?",
    answer: "Auto Fill",
    why: "Auto Fill detects and extends a recognised series. AutoSum adds numbers instead.",
    terms: [
      ["Auto Fill", "Copies data or continues a series."],
      ["Recalculation", "Updates formula results after inputs change."],
    ],
    demo: "formula",
  },
  starting: {
    goal: "Open Excel and create a new workbook.",
    explain: [
      "On a Windows computer, open Start, find Excel in All apps, and launch it. You can also search for Excel from Start. The exact menu appearance depends on your Windows version.",
      "On Excel’s start screen, choose Blank workbook. This creates a file with an initial worksheet. Book1 is a temporary name until the file is saved with your chosen name.",
      "An existing workbook can be reopened using File > Open or Ctrl + O. Creating a blank workbook and opening an existing workbook are different actions.",
    ],
    example: "Start → All apps → Excel → Blank workbook → Book1.",
    tryIt: "What should you choose to create an empty Excel file?",
    answer: "Blank workbook",
    why: "A blank workbook gives you a fresh worksheet ready for data entry.",
    terms: [
      ["Book1", "A temporary default name for a new workbook."],
      ["Blank workbook", "A new workbook without pre-filled data."],
    ],
    demo: "steps",
    steps: [
      "Open Start",
      "Find Excel in All apps or search",
      "Launch Excel",
      "Choose Blank workbook",
    ],
  },
  workbooks: {
    goal: "Tell a workbook, worksheet, row and column apart.",
    explain: [
      "Think of a workbook as a notebook and each worksheet as a page. Saving the workbook saves its worksheets together in one file. Sheet tabs near the bottom let you switch between pages.",
      "Rows are horizontal and numbered 1, 2, 3… Columns are vertical and lettered A, B, C… After Z, column names continue AA, AB and so on.",
      "Modern Excel worksheets have 1,048,576 rows and 16,384 columns, ending at XFD. The active worksheet is the sheet you are currently viewing and editing.",
    ],
    example:
      "Science.xlsx is a workbook. Term 1 and Term 2 can be two worksheets in it.",
    tryIt: "A workbook is like a notebook. A worksheet is like a…",
    answer: "Page",
    why: "A workbook contains sheets just as a notebook contains pages.",
    terms: [
      ["Workbook", "An Excel file containing one or more worksheets."],
      ["Worksheet", "One grid of rows and columns within a workbook."],
    ],
    demo: "sheets",
  },
  components: {
    goal: "Read cell addresses, ranges and the Excel interface.",
    explain: [
      "A cell address combines its column letter and row number. D5 means column D, row 5. The active cell has a visible selection border. The Name Box displays its address.",
      "A range is a group of cells. B3:D5 is a rectangle three columns wide and three rows high, so it contains nine cells. The colon means “through”; it is not a division symbol.",
      "The Formula Bar shows the selected cell’s content, including its formula. The cell itself normally displays the calculated result. The Title Bar shows the file name; the Status Bar at the bottom can show summaries for selected cells.",
    ],
    example: "Click D5 in the diagram. Its column is D and its row is 5.",
    tryIt: "How many cells are in B3:D5?",
    answer: "9",
    why: "There are 3 columns (B, C, D) and 3 rows (3, 4, 5): 3 × 3 = 9.",
    terms: [
      ["Name Box", "Displays the active cell address or selected range name."],
      ["Formula Bar", "Displays or edits the selected cell’s content."],
    ],
    demo: "grid",
  },
  navigation: {
    goal: "Move around a worksheet without losing your place.",
    explain: [
      "Arrow keys move one cell at a time. Enter normally moves down after an entry; Tab normally moves right. Page Up and Page Down move approximately one screen rather than one row.",
      "Ctrl + Home jumps to the beginning of the sheet, normally A1. Ctrl + End jumps to the last used cell, which can include cells with formatting; it does not jump to the worksheet’s maximum row.",
      "Ctrl + Page Up and Ctrl + Page Down switch worksheets. These are Windows desktop Excel shortcuts; macOS and browser versions may use different keys.",
    ],
    example:
      "From D5, press the right arrow to reach E5; press the down arrow to reach E6.",
    tryIt: "Which Windows shortcut jumps to A1?",
    answer: "Ctrl + Home",
    why: "Ctrl + Home returns to the beginning of the worksheet.",
    terms: [
      ["Ctrl + End", "Moves to the last used cell."],
      ["Page Down", "Moves approximately one screen down."],
    ],
    demo: "grid",
  },
  entry: {
    goal: "Enter, edit and organise the Weekly Expenses table.",
    explain: [
      "Select a cell, type a value, and press Enter. To edit an existing value, double-click the cell or use the Formula Bar. Press Escape to cancel an edit before committing it.",
      "In the textbook example, the title WEEKLY EXPENSES starts in D1. Headings are in row 2, Eatables is row 3, and Monday through Saturday occupy columns B through G. H is the total column.",
      "Merge & Center combines selected cells and centres the retained content. In real Excel, merging cells containing several values can discard all but the upper-left value. Our lab simulates the title merge and preserves all data.",
    ],
    example: "B3:G3 contains 50, 0, 200, 0, 0, 500. Its total belongs in H3.",
    tryIt: "Which cell contains the Eatables total in this textbook layout?",
    answer: "H3",
    why: "Eatables is row 3 and Total Expenses is column H.",
    terms: [
      [
        "Merge & Center",
        "Combines selected cells and centres the retained content.",
      ],
      ["Enter", "Commits the typed value, normally moving down."],
    ],
    demo: "formula",
  },
  data: {
    goal: "Recognise text, numbers and formulas.",
    explain: [
      "Text labels describe information: names, headings and item names. Numbers are values Excel can calculate with. Formulas are expressions beginning with = that calculate results.",
      "By default, text aligns left and numbers align right. This is a useful clue, but alignment can be changed manually, so it is not proof of a cell’s data type.",
      "Dates and times are stored internally as numbers and displayed using date or time formats. A leading apostrophe can force an entry to be treated as text, useful for identifiers with leading zeroes.",
    ],
    example: "“Eatables” is text; 500 is a number; =SUM(B3:G3) is a formula.",
    tryIt: "What type of entry is =B3+C3?",
    answer: "Formula",
    why: "The leading equals sign tells Excel to calculate the expression.",
    terms: [
      ["Text", "Labels or characters, usually left-aligned by default."],
      ["Number", "A numeric value used in calculations."],
    ],
    demo: "formula",
  },
  formulas: {
    goal: "Write formulas that calculate and recalculate correctly.",
    explain: [
      "Start every formula with =. Use + for addition, - for subtraction, * for multiplication and / for division. Excel uses * rather than the handwritten multiplication symbol ×.",
      "Cell references connect a formula to worksheet data. =B3+C3 adds the current values of B3 and C3. If B3 changes, the formula’s result updates automatically.",
      "Multiplication and division happen before addition and subtraction. Parentheses change the order: =2+3*4 gives 14, while =(2+3)*4 gives 20. A formula that refers back to itself creates a circular reference.",
    ],
    example:
      "Type =B3+C3+D3+E3+F3+G3 in H3. It gives 750 for the original data.",
    tryIt: "What is the result of =2+3*4?",
    answer: "14",
    why: "Multiply 3 × 4 first, then add 2. Use parentheses to make the addition happen first.",
    terms: [
      ["Cell reference", "A cell address used to read a value in a formula."],
      ["Formula", "An expression starting with = that calculates a result."],
    ],
    demo: "formula",
  },
  functions: {
    goal: "Use five essential functions and AutoSum.",
    explain: [
      "Functions are named, built-in calculations. Write the function name followed by parentheses containing its arguments. =SUM(B3:G3) adds every numeric value in that range.",
      "AVERAGE adds the numeric values and divides by how many there are. COUNT counts numeric cells. Zero is a number, so it is included; blank cells and text in referenced ranges are ignored.",
      "MAX returns the largest numeric value and MIN the smallest. AutoSum suggests a SUM formula for a nearby range. Always check the suggested range before confirming it. AutoSum appears on the Home and Formulas tabs.",
    ],
    example:
      "For 50, 0, 200, 0, 0, 500: SUM = 750; AVERAGE = 125; COUNT = 6; MAX = 500; MIN = 0.",
    tryIt: "How many numbers does COUNT find in 50, 0, 200, 0, 0, 500?",
    answer: "6",
    why: "All six cells are numeric. COUNT includes the three zeroes.",
    terms: [
      ["Argument", "A value, reference or range passed into a function."],
      ["AutoSum", "Suggests a SUM formula for nearby cells."],
    ],
    demo: "formula",
  },
  management: {
    goal: "Create, rename and switch worksheets.",
    explain: [
      "Use the + button beside sheet tabs to insert a worksheet. You can also use Home > Cells > Insert > Insert Sheet. A workbook can contain several sheets organised by topic or month.",
      "Double-click a tab, type a useful name and press Enter to rename it. Clicking a tab activates that worksheet. Changing its name does not create another workbook.",
      "To remove a sheet, use its tab’s context menu or Home > Cells > Delete > Delete Sheet. Check for important data first: deleting a sheet removes that sheet’s contents.",
    ],
    example:
      "Create a new sheet, rename it Revision, then switch back to Expenses in the demonstration.",
    tryIt: "What is the quickest way to rename a worksheet tab?",
    answer: "Double-click the tab",
    why: "Double-clicking lets you edit the tab name. Press Enter to confirm it.",
    terms: [
      ["Sheet tab", "A labelled control for switching worksheets."],
      ["Active worksheet", "The worksheet currently selected."],
    ],
    demo: "sheets",
  },
  saving: {
    goal: "Save your work and choose the right shortcut.",
    explain: [
      "Saving writes the workbook to storage. The first save asks for a location and filename. Later saves update that file. Use File > Save or Ctrl + S on Windows desktop Excel.",
      "Save As creates a file with a different name, location or format. F12 opens Save As in desktop Excel. The usual modern workbook extension is .xlsx.",
      "Ctrl + O opens a workbook; F5 opens Go To; Ctrl + Shift + U expands or collapses the Formula Bar. Shortcuts can vary across platforms. Save regularly to avoid losing work.",
    ],
    example:
      "Save Book1 as Weekly Expenses.xlsx in your chosen folder. Use Ctrl + S after further edits.",
    tryIt: "Which extension identifies a standard modern Excel workbook?",
    answer: ".xlsx",
    why: ".xlsx is the normal modern Excel workbook format.",
    terms: [
      [
        "Save",
        "Updates the current file, or asks for details on its first save.",
      ],
      ["Save As", "Saves under a chosen name, location or format."],
    ],
    demo: "steps",
    steps: [
      "Choose File > Save As",
      "Choose a folder",
      "Enter Weekly Expenses.xlsx",
      "Click Save",
      "Use Ctrl + S for later edits",
    ],
  },
  facts: {
    goal: "Connect spreadsheet history with modern Excel facts.",
    explain: [
      "VisiCalc was an early electronic spreadsheet created by Dan Bricklin and Bob Frankston. It helped establish the idea that changing one input could instantly update connected calculations.",
      "Modern Excel’s grid is much larger than the visible screen: 1,048,576 rows and 16,384 columns. A cell can hold up to 32,767 characters, though all of them may not be visible at once.",
      "Page Layout > Background adds a sheet background image in desktop Excel. A worksheet background is for display and is not printed as a normal printable image.",
    ],
    example:
      "A large grid does not mean every cell contains data. Ctrl + End finds the used area, not XFD1048576.",
    tryIt: "Who created VisiCalc?",
    answer: "Dan Bricklin and Bob Frankston",
    why: "Bricklin and Frankston created VisiCalc, an important early spreadsheet.",
    terms: [
      ["VisiCalc", "An early spreadsheet by Dan Bricklin and Bob Frankston."],
      ["XFD", "The last column in a modern Excel worksheet."],
    ],
    demo: "steps",
    steps: [
      "1979: VisiCalc introduced",
      "Electronic calculations update together",
      "Modern Excel: 1,048,576 rows",
      "16,384 columns, A through XFD",
    ],
  },
};
