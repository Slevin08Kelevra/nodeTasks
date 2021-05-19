const test = {
    prop: 42,
    test: "",
    func: function(p) {
      p();
    },
    sett: function(){
        this.test = "hola"
    }
  };
  
  function print(){console.log(this.test)}

  test.sett()
  
  test.func(print)