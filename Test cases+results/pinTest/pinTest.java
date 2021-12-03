package com.selenium;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;

public class pinTest {
    public static void main(String[] args) throws InterruptedException {
        System.setProperty("webdriver.chrome.driver", "C:\\Users\\kevin\\Desktop\\Selenium\\chromedriver_win32\\chromedriver.exe");
        WebDriver driver = new ChromeDriver();

        //Navigates to Spotifyn
        driver.get("https://spotipyn.chocomint.dev");

        //Logs in
        driver.findElement(By.xpath("//*[@id=\"right\"]/a/img")).click();
        driver.findElement(By.id("login-username")).sendKeys("testaccount192837436@gmail.com");
        driver.findElement(By.id("login-password")).sendKeys("TestAccount123");
        driver.findElement(By.xpath("//*[@id=\"login-button\"]")).click();
        Thread.sleep(2000);
        driver.findElement(By.xpath("//*[@id=\"auth-accept\"]")).click();

        Thread.sleep(10000);

        //clicks on pin
        driver.findElement(By.xpath("//*[@id=\"pin\"]")).click();

        Thread.sleep(2000);

        //Creates the pin
        driver.findElement(By.xpath("//*[@id=\"mode\"]")).click();
        driver.findElement(By.xpath("//*[@id=\"mode\"]/option[3]")).click();
        Thread.sleep(2000);
        driver.findElement(By.id("hour")).sendKeys("0");
        driver.findElement(By.id("minute")).sendKeys("0");
        driver.findElement(By.id("second")).sendKeys("10");
        driver.findElement(By.id("message")).sendKeys("test");
        driver.findElement(By.xpath("//*[@id=\"submit\"]")).click();

        Thread.sleep(5000);

        String at = driver.findElement(By.id("table-message")).getText();
        String et = "test";

        if(at.equalsIgnoreCase(et)){
            System.out.println("Test for creating and displaying pin: Passed");
        }
        else{
            System.out.println("Test for creating and displaying pin: Failed");
        }

    }
}
