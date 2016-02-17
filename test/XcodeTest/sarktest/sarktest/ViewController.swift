//
//  ViewController.swift
//  sarktest
//
//  Created by Lorenzo Piccoli on 17/02/16.
//  Copyright © 2016 Lorenzo Piccoli. All rights reserved.
//

import UIKit

class ViewController: UIViewController {

    override func viewDidLoad() {
        super.viewDidLoad()
        // Do any additional setup after loading the view, typically from a nib.
        
        let sark = UILabel(frame: CGRect(x: self.view.frame.size.width / 2, y: self.view.frame.size.width / 2, width: 100, height: 20))
        sark.text = "Sark rocks!"
        view.addSubview(sark);
        
        var thisIsAWarning = "";
    }

    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
        // Dispose of any resources that can be recreated.
    }


}

