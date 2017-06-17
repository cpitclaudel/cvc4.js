// Source: http://smtlib.cs.uiowa.edu/examples.shtml
var smtlib_examples = { "Basic example":
                        ["(set-option :print-success false)",
                         "(set-logic QF_UF)",
                         "(declare-const p Bool)",
                         "(assert (and p (not p)))",
                         "(check-sat) ; returns 'unsat'",
                         "(exit)"],

                        "Integer arithmetic":
                        ["(set-logic QF_LIA)",
                         "(declare-const x Int)",
                         "(declare-const y Int)",
                         "(assert (= (- x y) (+ x (- y) 1)))",
                         "(check-sat)",
                         "; unsat",
                         "(exit)"],

                        "Getting values or models":
                        ["(set-option :print-success false)",
                         "(set-option :produce-models true)",
                         "(set-logic QF_LIA)",
                         "(declare-const x Int)",
                         "(declare-const y Int)",
                         "(assert (= (+ x (* 2 y)) 20))",
                         "(assert (= (- x y) 2))",
                         "(check-sat)",
                         "; sat",
                         "(get-value (x y))",
                         "; ((x 8) (y 6))",
                         "(get-model)",
                         "; ((define-fun x () Int 8)",
                         ";  (define-fun y () Int 6)",
                         "; )",
                         "(exit)"],

                        "Modeling sequential code in SSA form":
                        [";; Buggy swap",
                         "; int x, y;",
                         "; int t = x;",
                         "; x = y;",
                         "; y = x;",
                         "",
                         "(set-logic QF_UFLIA)",
                         "(set-option :produce-models true)",
                         "(declare-fun x (Int) Int)",
                         "(declare-fun y (Int) Int)",
                         "(declare-fun t (Int) Int)",
                         "(assert (= (t 0) (x 0)))",
                         "(assert (= (y 1) (t 0)))",
                         "(assert (= (x 1) (y 1)))",
                         "",
                         "(assert (not",
                         "  (and (= (x 1) (y 0))",
                         "       (= (y 1) (x 0)))))",
                         "(check-sat)",
                         "(get-value ((x 0) (y 0) (x 1) (y 1)))",
                         "; possible returned valuation:",
                         "; (((x 0) (- 1)) ((y 0) 2) ((x 1) (- 1)) ((y 1) (- 1)))",
                         "(get-model)",
                         "; possible returned model:",
                         "; (",
                         ";  (define-fun x ((_ufmt_1 Int)) Int (- 1))",
                         ";  (define-fun y ((_ufmt_1 Int)) Int (ite (= _ufmt_1 1) (- 1) 2))",
                         ";  (define-fun t ((_ufmt_1 Int)) Int (- 1))",
                         "; )",
                         "(exit)"],

                        "Modeling sequential code with bitvectors":
                        [";; Correct swap with no temp var",
                         "; int x, y;",
                         "; x = x + y;",
                         "; y = x - y;",
                         "; x = x - y;",
                         "",
                         "(set-logic QF_BV)",
                         "(set-option :produce-models true)",
                         "",
                         "(declare-const x_0 (_ BitVec 32))",
                         "(declare-const x_1 (_ BitVec 32))",
                         "(declare-const x_2 (_ BitVec 32))",
                         "(declare-const y_0 (_ BitVec 32))",
                         "(declare-const y_1 (_ BitVec 32))",
                         "(assert (= x_1 (bvadd x_0 y_0)))",
                         "(assert (= y_1 (bvsub x_1 y_0)))",
                         "(assert (= x_2 (bvsub x_1 y_1)))",
                         "",
                         "(assert (not",
                         "  (and (= x_2 y_0)",
                         "       (= y_1 x_0))))",
                         "(check-sat)",
                         "; unsat",
                         "(exit)"],

                        "Using scopes to explore multiple problems":
                        ["(set-option :print-success false)",
                         "(set-logic QF_LIA)",
                         "(declare-const x Int) (declare-const y Int)",
                         "(assert (= (+ x (* 2 y)) 20))",
                         "(push 1)",
                         "  (assert (= (- x y) 2))",
                         "  (check-sat)",
                         "  ; sat",
                         "(pop 1)",
                         "(push 1)",
                         "  (assert (= (- x y) 3))",
                         "  (check-sat)",
                         "  ; unsat",
                         "(pop 1)",
                         "(exit)"],

                        "Defining and using new sorts":
                        ["(set-option :print-success false)",
                         "(set-logic QF_UF)",
                         "(declare-sort A 0)",
                         "(declare-const a A) (declare-const b A) (declare-const c A)",
                         "(declare-const d A) (declare-const e A)",
                         "(assert (or (= c a)(= c b)))",
                         "(assert (or (= d a)(= d b)))",
                         "(assert (or (= e a)(= e b)))",
                         "(push 1)",
                         "  (assert (distinct c d))",
                         "  (check-sat)",
                         "  ; sat",
                         "(pop 1)",
                         "(push 1)",
                         "  (assert (distinct c d e))",
                         "  (check-sat)",
                         "  ; unsat",
                         "(pop 1)",
                         "(exit)"],

                        "Getting info":
                        ["(get-info :name)",
                         "; (:name \"CVC4\")",
                         "(get-info :version )",
                         "; (:version \"4.0\" )",
                         "(get-info :authors )",
                         "; (:authors \"The CVC4 Team\" )",
                         "(exit)"],

                        "Getting assignments":
                        ["(set-option :produce-assignments true)",
                         "(set-logic QF_UF)",
                         "(declare-const p Bool) (declare-const q Bool) (declare-const r Bool)",
                         "(assert (not (=(! (and (! p :named P) q) :named PQ) (! r :named R))))",
                         "(check-sat)",
                         "; sat",
                         "(get-assignment)",
                         "; ((P true) (R false) (PQ true))",
                         "(exit)"],

                        "Getting unsatisfiable cores":
                        ["(set-option :produce-unsat-cores true)",
                         "(set-logic QF_UF)",
                         "(declare-const p Bool) (declare-const q Bool) (declare-const r Bool)",
                         "(declare-const s Bool) (declare-const t Bool)",
                         "(assert (! (=> p q) :named PQ))",
                         "(assert (! (=> q r) :named QR))",
                         "(assert (! (=> r s) :named RS))",
                         "(assert (! (=> s t) :named ST))",
                         "(assert (! (not (=> q s)) :named NQS))",
                         "(check-sat)",
                         "; unsat",
                         "(get-unsat-core)",
                         "; (QR RS NQS)",
                         "(exit)"],

                        "Getting assertions":
                        ["(set-option :produce-assertions true)",
                         "(set-logic QF_UF)",
                         "(declare-const p Bool) (declare-const q Bool)",
                         "(push 1)",
                         " (assert (or p q))",
                         " (push 1)",
                         "  (assert (not q))",
                         "  (get-assertions)",
                         "  ; ((or p q)",
                         "  ;  (not q)",
                         "  ; )",
                         " (pop 1)",
                         "  (get-assertions)",
                         " ; ((or p q))",
                         " (pop 1)",
                         " (get-assertions)",
                         " ; ()",
                         "(exit)"] };